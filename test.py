import requests

headers = {
    "Authorization": "Bearer AsqKWkaN-D5zoyf7x-CWZRPt5u-XrNhxHxh"
}

params = {
    "customerName": "testCustomer"
}

response = requests.get(
    "https://tac3.connect8bo.com/expose_api/player/personal-game-and-financial-data",
    headers=headers,
    params=params,
    verify=False  # 关闭 SSL 验证（仅测试）
)

print(response.status_code)
print(response.json())
