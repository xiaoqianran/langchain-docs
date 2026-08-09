<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Oauth Setup Callback | https://docs.langchain.com/api-reference/auth-service-v2/oauth-setup-callback -->

# Oauth 设置回调

https://api.host.langchain.com/openapi.json 获取/v2/auth/setup/{provider_id}
处理来自 GitHub Apps 的 OAuth 设置回调重定向。

此端点处理来自 GitHub Apps 的“Setup URL”回调，即
当用户安装或更新其 GitHub 应用程序安装时触发。

对于“更新”操作（用户通过 GitHub 修改存储库访问），我们只显示
成功页面，因为不需要令牌交换。

对于带有代码/状态的新安装，我们的处理类似于常规的
OAuth 回调。