import { startTransition } from 'react';
import { Button, Card, Form, Input, Tag, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore, usePermissionStore } from '@/stores';
import { env } from '@office/lib';
import { Redirect } from '@office/lib/router';
import type { LoginParams } from '@/types';
import styles from './index.module.scss';

const LoginPage = observer(function LoginPage() {
  const auth = useAuthStore();
  const permission = usePermissionStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 已登录直接进首页（走过渡安全跳转，避免懒加载页面同步挂起）
  if (auth.isLogin) {
    return <Redirect to="/" />;
  }

  const from = (location.state as { from?: string } | null)?.from;

  const onFinish = async (values: LoginParams) => {
    try {
      await auth.login(values);
      startTransition(() => {
        navigate(from || permission.homePath, { replace: true });
      });
    } catch {
      /* 错误提示由请求库统一弹出 */
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card} variant="outlined">
        <div className={styles.header}>
          <div className={styles.logo}>A</div>
          <Typography.Title level={4} className={styles.title}>
            {env.APP_TITLE}
          </Typography.Title>
          <Typography.Text type="secondary">TypeScript · React · MobX</Typography.Text>
        </div>

        <Form<LoginParams>
          size="large"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: 'admin', password: '123456' }}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入账号" allowClear />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={auth.submitting}>
            登录
          </Button>
        </Form>

        <div className={styles.tips}>
          <Typography.Text type="secondary">演示账号：</Typography.Text>
          <div className={styles.accounts}>
            <Tag color="blue">admin / 123456 · 全部权限</Tag>
            <Tag color="green">operator / 123456 · 只读权限</Tag>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default LoginPage;
