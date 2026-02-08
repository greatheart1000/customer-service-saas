import json
import logging
import os
import time
from typing import Optional

from cozepy import (
    COZE_CN_BASE_URL,
    AsyncCoze,
    ChatStatus,
    Coze,
    DeviceOAuthApp,
    Message,
    MessageContentType,
    Stream,
    TokenAuth,
    WorkflowEvent,
    WorkflowEventType,
    WorkflowExecuteStatus,
    setup_logging,
)


class WorkflowService:
    """Service for handling workflow operations."""

    def __init__(self):
        """Initialize the workflow service."""
        self.coze = Coze(
            auth=TokenAuth(token=self._get_coze_api_token()),
            base_url=self._get_coze_api_base(),
        )
        self.async_coze = AsyncCoze(
            auth=TokenAuth(token=self._get_coze_api_token()),
            base_url=self._get_coze_api_base(),
        )

    def _get_coze_api_base(self) -> str:
        """Get the Coze API base URL."""
        coze_api_base = os.getenv("COZE_API_BASE")
        if coze_api_base:
            return coze_api_base
        return COZE_CN_BASE_URL  # default

    def _get_coze_api_token(self, workspace_id: Optional[str] = None) -> str:
        """Get an access_token through personal access token or oauth."""
        coze_api_token = os.getenv("COZE_API_TOKEN")
        if coze_api_token:
            return coze_api_token

        coze_api_base = self._get_coze_api_base()

        device_oauth_app = DeviceOAuthApp(
            client_id="57294420732781205987760324720643.app.coze", 
            base_url=coze_api_base
        )
        device_code = device_oauth_app.get_device_code(workspace_id)
        print(f"Please Open: {device_code.verification_url} to get the access token")
        return device_oauth_app.get_access_token(
            device_code=device_code.device_code, 
            poll=True
        ).access_token

    def get_workflow_id(self) -> str:
        """Get the workflow ID from environment variables."""
        workflow_id = os.getenv("COZE_WORKFLOW_ID")
        if not workflow_id:
            raise ValueError("COZE_WORKFLOW_ID environment variable is required")
        return workflow_id

    def run_workflow_stream(self, parameters: dict = None) -> str:
        """
        Run a workflow with streaming response.
        
        Args:
            parameters: Workflow parameters
            
        Returns:
            Combined response from the workflow
        """
        if parameters is None:
            parameters = json.loads(os.getenv("COZE_PARAMETERS") or "{}")
            
        workflow_id = self.get_workflow_id()
        
        response_text = ""
        
        # The stream interface will return an iterator of WorkflowEvent
        for event in self.coze.workflows.runs.stream(
            workflow_id=workflow_id,
            parameters=parameters,
        ):
            if event.event == WorkflowEventType.MESSAGE:
                response_text += str(event.message)
                print("Got message:", event.message)
            elif event.event == WorkflowEventType.ERROR:
                print("Got error:", event.error)
                response_text += f"Error: {event.error}"
            elif event.event == WorkflowEventType.INTERRUPT:
                # Handle interrupt by resuming
                print("Got interrupt, resuming...")
                resume_result = self.coze.workflows.runs.resume(
                    workflow_id=workflow_id,
                    event_id=event.interrupt.interrupt_data.event_id,
                    resume_data="Resumed by customer service system",
                    interrupt_type=event.interrupt.interrupt_data.type,
                )
                # Continue processing the resumed workflow
                for resume_event in resume_result:
                    if resume_event.event == WorkflowEventType.MESSAGE:
                        response_text += str(resume_event.message)
                        print("Resume message:", resume_event.message)
        
        return response_text

    def run_workflow_no_stream(self) -> dict:
        """
        Run a workflow without streaming response.
        
        Returns:
            Workflow result data
        """
        workflow_id = self.get_workflow_id()
        
        # Call the coze.workflows.runs.create method to create a workflow run
        workflow_result = self.coze.workflows.runs.create(
            workflow_id=workflow_id,
        )
        
        print("Workflow data:", workflow_result.data)
        return workflow_result.data

    def run_workflow_async(self) -> dict:
        """
        Run a workflow asynchronously and fetch results.
        
        Returns:
            Final workflow result
        """
        workflow_id = self.get_workflow_id()
        
        # Whether to print detailed logs
        is_debug = os.getenv("DEBUG")
        if is_debug:
            setup_logging(logging.DEBUG)
        
        # Call the coze.workflows.runs.create method to create a workflow run
        workflow_run = self.coze.workflows.runs.create(
            workflow_id=workflow_id, 
            is_async=True
        )
        
        print("Start async workflow run:", workflow_run.execute_id)
        
        while True:
            run_history = self.coze.workflows.runs.run_histories.retrieve(
                workflow_id=workflow_id, 
                execute_id=workflow_run.execute_id
            )
            if run_history.execute_status == WorkflowExecuteStatus.FAIL:
                print("Workflow run fail:", run_history.error_message)
                return {
                    "status": "failed",
                    "error": run_history.error_message
                }
            elif run_history.execute_status == WorkflowExecuteStatus.RUNNING:
                print("Workflow still running, sleep 1s and continue")
                time.sleep(1)
                continue
            else:
                print("Workflow run success:", run_history.output)
                return {
                    "status": "success",
                    "output": run_history.output
                }

    def handle_workflow_chat_stream(self, user_input: str) -> str:
        """
        Handle workflow chat with streaming response.
        
        Args:
            user_input: User's input message
            
        Returns:
            Response from the workflow
        """
        workflow_id = self.get_workflow_id()
        parameters = {"input": user_input}
        
        response_text = ""
        
        # Run workflow with streaming
        for event in self.coze.workflows.runs.stream(
            workflow_id=workflow_id,
            parameters=parameters,
        ):
            if event.event == WorkflowEventType.MESSAGE:
                response_text += str(event.message)
                print("Workflow message:", event.message)
            elif event.event == WorkflowEventType.ERROR:
                print("Workflow error:", event.error)
                response_text += f"Error: {event.error}"
        
        return response_text

    def handle_workflow_chat_multimodal_stream(self, user_input: str, image_file_id: str = None) -> str:
        """
        Handle workflow chat with multimodal streaming response.
        
        Args:
            user_input: User's input message
            image_file_id: Optional image file ID
            
        Returns:
            Response from the workflow
        """
        workflow_id = self.get_workflow_id()
        
        # Prepare parameters
        parameters = {"input": user_input}
        if image_file_id:
            parameters["image_file_id"] = image_file_id
            
        response_text = ""
        
        # Run workflow with streaming
        for event in self.coze.workflows.runs.stream(
            workflow_id=workflow_id,
            parameters=parameters,
        ):
            if event.event == WorkflowEventType.MESSAGE:
                response_text += str(event.message)
                print("Workflow message:", event.message)
            elif event.event == WorkflowEventType.ERROR:
                print("Workflow error:", event.error)
                response_text += f"Error: {event.error}"
        
        return response_text

    def list_workflow_versions(self) -> list:
        """
        List all versions of a workflow.
        
        Returns:
            List of workflow versions
        """
        workflow_id = self.get_workflow_id()
        
        # Get workflow versions
        versions = self.coze.workflows.versions.list(workflow_id=workflow_id)
        
        version_list = []
        for version in versions:
            version_list.append({
                "version": version.version,
                "created_at": version.created_at,
                "status": version.status
            })
            print(f"Version: {version.version}, Created: {version.created_at}, Status: {version.status}")
        
        return version_list