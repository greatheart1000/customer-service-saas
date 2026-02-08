"""
数据库会话管理
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 数据库 URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:testpass123@localhost:3306/saas_customer_service"
)

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# 创建 SessionLocal 类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    获取数据库会话
    用于 FastAPI 依赖注入
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库（创建所有表）"""
    from app.db.base import Base
    Base.metadata.create_all(bind=engine)
