from app.db.session import engine
from app.models import user, organization, conversation, bot

# 创建所有表
user.Base.metadata.create_all(bind=engine)
organization.Base.metadata.create_all(bind=engine)
conversation.Base.metadata.create_all(bind=engine)
bot.Base.metadata.create_all(bind=engine)

print("✅ 数据库表创建成功！")
