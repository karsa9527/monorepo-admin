import { useEffect, useState } from 'react';
import { App, Button, Card, Checkbox, Drawer, Empty, Space, Table, Tag, Typography } from 'antd';
import { EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { observer } from 'mobx-react-lite';
import Auth from '@/components/auth';
import { roleService } from './service';
import type { RoleItem } from '@/types';
import { PERMISSION_GROUPS, PERMISSION_LABEL_MAP } from '@/constants/permission';
import { useRequest } from '@office-admin/lib/hooks';

const RoleListPage = observer(function RoleListPage() {
  const { message } = App.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<RoleItem | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, loading, run: fetchRoles } = useRequest<RoleItem[]>(() => roleService.getRoles());

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const openDrawer = (record: RoleItem) => {
    setCurrent(record);
    setChecked(record.permissions);
    setDrawerOpen(true);
  };

  const onSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      await roleService.updateRole(current.id, { permissions: checked });
      message.success('权限已更新');
      setDrawerOpen(false);
      await fetchRoles();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<RoleItem> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '角色名称', dataIndex: 'name', width: 140 },
    { title: '标识', dataIndex: 'code', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '描述', dataIndex: 'description' },
    {
      title: '权限数',
      dataIndex: 'permissions',
      width: 100,
      render: (list: string[]) => <Tag color="blue">{list.length}</Tag>,
    },
    { title: '用户数', dataIndex: 'userCount', width: 90 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Auth
          code="system:role:update"
          fallback={<Typography.Text type="secondary">只读</Typography.Text>}
        >
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openDrawer(record)}
          >
            配置权限
          </Button>
        </Auth>
      ),
    },
  ];

  return (
    <>
      <Card title="角色管理" extra={<SafetyCertificateOutlined style={{ color: '#1677ff' }} />}>
        <Table<RoleItem>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={data ?? []}
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>

      <Drawer
        title={current ? `配置权限 · ${current.name}` : '配置权限'}
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Auth code="system:role:update">
              <Button type="primary" loading={saving} onClick={onSave}>
                保存
              </Button>
            </Auth>
          </Space>
        }
      >
        {Object.entries(PERMISSION_GROUPS).length ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Typography.Text type="secondary">
              共 {Object.values(PERMISSION_GROUPS).flat().length} 个权限点，已选 {checked.length} 个
            </Typography.Text>
            {Object.entries(PERMISSION_GROUPS).map(([group, items]) => (
              <div key={group}>
                <Typography.Text strong>{group}</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Checkbox.Group
                    style={{ width: '100%' }}
                    value={checked}
                    onChange={(values) => setChecked(values as string[])}
                    options={items.map((i) => ({ label: i.label, value: i.code }))}
                  />
                </div>
              </div>
            ))}
            {checked.length > 0 && (
              <div>
                <Typography.Text type="secondary">已授权：</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  {checked.map((code) => (
                    <Tag key={code} color="blue" style={{ marginBottom: 4 }}>
                      {PERMISSION_LABEL_MAP[code] ?? code}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Space>
        ) : (
          <Empty description="暂无权限点配置" />
        )}
      </Drawer>
    </>
  );
});

export default RoleListPage;
