import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { Avatar } from 'antd';
import { observer } from 'mobx-react-lite';
import Auth from '@/components/auth';
import { useAuthStore, usePermissionStore } from '@/stores';
import { PERMISSION_LABEL_MAP } from '@/constants/permission';
import { formatDate, maskPhone } from '@office-admin/lib';

const ProfilePage = observer(function ProfilePage() {
  const auth = useAuthStore();
  const permission = usePermissionStore();
  const user = auth.userInfo;

  if (!user) return null;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space size={16} align="center">
          <Avatar size={64} src={user.avatar}>
            {user.nickname?.[0]}
          </Avatar>
          <Space direction="vertical" size={2}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {user.nickname}
            </Typography.Title>
            <Typography.Text type="secondary">@{user.username}</Typography.Text>
          </Space>
        </Space>
      </Card>

      <Card title="基本信息">
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="用户 ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="账号">{user.username}</Descriptions.Item>
          <Descriptions.Item label="手机号">{maskPhone(user.phone)}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={user.status === 1 ? 'green' : 'default'}>
              {user.status === 1 ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDate(user.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="角色" span={2}>
            {user.roles.map((r) => (
              <Tag key={r} color="blue">
                {r}
              </Tag>
            ))}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="我的权限"
        extra={
          <Typography.Text type="secondary">
            {permission.isSuperAdmin ? '超级管理员' : `${permission.permissions.length} 个权限点`}
          </Typography.Text>
        }
      >
        {permission.isSuperAdmin ? (
          <Typography.Text>拥有全部权限（通配符 *）</Typography.Text>
        ) : (
          <Space size={[8, 8]} wrap>
            {permission.permissions.map((code) => (
              <Tag key={code}>{PERMISSION_LABEL_MAP[code] ?? code}</Tag>
            ))}
          </Space>
        )}

        <Auth
          code="system:user:export"
          fallback={
            <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
              你没有「导出用户」权限，因此上方的导出按钮不会渲染。
            </Typography.Paragraph>
          }
        >
          <Typography.Paragraph style={{ marginTop: 16 }} type="success">
            你拥有「导出用户」权限，用户管理页会展示导出按钮。
          </Typography.Paragraph>
        </Auth>
      </Card>
    </Space>
  );
});

export default ProfilePage;
