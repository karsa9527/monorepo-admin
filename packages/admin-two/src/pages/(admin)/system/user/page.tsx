import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { observer } from 'mobx-react-lite';
import Auth, { usePermission } from '@/components/auth';
import { userService } from './service';
import type { PageParams, UserInfo } from '@/types';
import { useRequest } from '@office/lib/hooks';
import { exportCsv, maskPhone } from '@office/lib';

interface SearchForm extends PageParams {
  keyword?: string;
  status?: string;
}

const UserListPage = observer(function UserListPage() {
  const { has } = usePermission();
  const { message } = App.useApp();
  const [form] = Form.useForm<SearchForm>();
  const [params, setParams] = useState<PageParams>({ page: 1, pageSize: 10 });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm<Partial<UserInfo>>();

  const {
    data,
    loading,
    run: fetchUsers,
  } = useRequest<{ list: UserInfo[]; total: number }, [PageParams]>(
    (p) => userService.getUsers(p),
    { manual: true },
  );

  useEffect(() => {
    void fetchUsers(params);
  }, [params, fetchUsers]);

  const onSearch = useCallback(() => {
    const values = form.getFieldsValue();
    setParams((prev) => ({ ...prev, page: 1, ...values }));
  }, [form]);

  const onCreate = async () => {
    const values = await createForm.validateFields();
    await userService.createUser(values);
    setCreateOpen(false);
    createForm.resetFields();
    void fetchUsers(params);
  };

  const onDelete = async (id: number) => {
    await userService.deleteUser(id);
    void fetchUsers(params);
  };

  const onExport = () => {
    const list = data?.list ?? [];
    if (!list.length) {
      message.warning('暂无数据可导出');
      return;
    }
    exportCsv(
      list.map((u) => ({
        账号: u.username,
        姓名: u.nickname,
        手机号: u.phone,
        邮箱: u.email,
        角色: u.roles.join('/'),
        状态: u.status === 1 ? '启用' : '禁用',
      })),
      `用户列表-${Date.now()}.csv`,
    );
  };

  const columns: ColumnsType<UserInfo> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '用户',
      dataIndex: 'nickname',
      render: (_, record) => (
        <Space>
          <Avatar size={28} src={record.avatar}>
            {record.nickname?.[0]}
          </Avatar>
          <span>{record.nickname}</span>
          <Typography.Text type="secondary">{record.username}</Typography.Text>
        </Space>
      ),
    },
    { title: '手机号', dataIndex: 'phone', render: (v: string) => maskPhone(v), width: 130 },
    { title: '邮箱', dataIndex: 'email', width: 200 },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 160,
      render: (roles: string[]) =>
        roles.map((r) => (
          <Tag key={r} color={r === 'admin' ? 'red' : r === 'operator' ? 'blue' : 'default'}>
            {r}
          </Tag>
        )),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: 0 | 1) => (
        <Tag color={status === 1 ? 'green' : 'default'}>{status === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Auth code="system:user:update">
            <Button type="link" size="small">
              编辑
            </Button>
          </Auth>
          <Auth code="system:user:delete">
            <Popconfirm title="确认删除该用户？" onConfirm={() => onDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Auth>
          {!has('system:user:update') && !has('system:user:delete') && (
            <Typography.Text type="secondary">无操作权限</Typography.Text>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Form form={form} layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" style={{ marginBottom: 0 }}>
            <Input placeholder="搜索账号 / 姓名" allowClear prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="status" style={{ marginBottom: 0 }}>
            <Select
              allowClear
              placeholder="状态"
              style={{ width: 120 }}
              options={[
                { value: '1', label: '启用' },
                { value: '0', label: '禁用' },
              ]}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setParams({ page: 1, pageSize: 10 });
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="用户列表"
        extra={
          <Space>
            <Auth code="system:user:export">
              <Button icon={<DownloadOutlined />} onClick={onExport}>
                导出 CSV
              </Button>
            </Auth>
            <Auth code="system:user:create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                新增用户
              </Button>
            </Auth>
          </Space>
        }
      >
        <Table<UserInfo>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={data?.list ?? []}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setParams((prev) => ({ ...prev, page, pageSize })),
          }}
        />
      </Card>

      <Modal
        title="新增用户"
        open={createOpen}
        onOk={onCreate}
        onCancel={() => setCreateOpen(false)}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
});

export default UserListPage;
