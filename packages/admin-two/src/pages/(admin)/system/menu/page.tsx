import { useMemo } from 'react';
import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { observer } from 'mobx-react-lite';
import { usePermissionStore } from '@/stores';
import { constantRoutes } from '@office/lib/router';
import { PERMISSION_LABEL_MAP } from '@/constants/permission';
import { flattenRoutes } from '@office/lib/router';
import type { FlatRoute } from '@office/lib/router';

/** 菜单管理：展示前端静态路由表与权限点映射（真实项目可由后端下发） */
const MenuListPage = observer(function MenuListPage() {
  const permission = usePermissionStore();

  const rows = useMemo<FlatRoute[]>(() => flattenRoutes(constantRoutes), []);

  const columns: ColumnsType<FlatRoute> = [
    {
      title: '路由地址',
      dataIndex: 'fullPath',
      width: 220,
      render: (path: string) => <Typography.Text code>{path}</Typography.Text>,
    },
    {
      title: '菜单名称',
      dataIndex: 'meta',
      width: 160,
      render: (meta: FlatRoute['meta']) => meta?.title ?? '-',
    },
    {
      title: '权限点',
      dataIndex: 'meta',
      width: 220,
      render: (meta: FlatRoute['meta']) => {
        const codes = meta?.permission
          ? Array.isArray(meta.permission)
            ? meta.permission
            : [meta.permission]
          : [];
        if (!codes.length) return <Tag>公开</Tag>;
        return (
          <Space size={4} wrap>
            {codes.map((c) => (
              <Tag key={c} color={permission.has(c) ? 'green' : 'default'}>
                {PERMISSION_LABEL_MAP[c] ?? c}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '菜单展示',
      dataIndex: 'meta',
      width: 120,
      render: (meta: FlatRoute['meta']) =>
        meta?.hideInMenu ? <Tag color="orange">隐藏</Tag> : <Tag color="blue">显示</Tag>,
    },
    {
      title: '当前账号',
      key: 'access',
      render: (_, record) =>
        permission.canAccess(record.meta) ? (
          <Tag color="success">可访问</Tag>
        ) : (
          <Tag color="error">无权限</Tag>
        ),
    },
  ];

  return (
    <Card
      title="菜单与权限点"
      extra={
        <Typography.Text type="secondary">
          共 {rows.length} 条路由，当前账号 {permission.permissions.length} 个权限点
        </Typography.Text>
      }
    >
      <Table<FlatRoute>
        rowKey="fullPath"
        size="middle"
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
      />
    </Card>
  );
});

export default MenuListPage;
