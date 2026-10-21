import { Card, Col, Empty, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@/stores';
import { dashboardService } from './service';
import type { DashboardStats } from '@/types';
import { useRequest } from '@office-admin/lib/hooks';
import { formatDate, formatNumber } from '@office-admin/lib';
import styles from './index.module.scss';

const LEVEL_COLOR: Record<string, string> = {
  high: 'red',
  normal: 'blue',
  low: 'default',
};

/** 简易柱状图：不引入图表库也能直观展示趋势 */
function MiniBarChart({ data }: { data: DashboardStats['week'] }) {
  const max = Math.max(...data.map((d) => d.visits), 1);
  return (
    <div className={styles.chart}>
      {data.map((item) => (
        <div key={item.day} className={styles.barItem}>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ height: `${(item.visits / max) * 100}%` }}
              title={`访问 ${item.visits}`}
            />
          </div>
          <span className={styles.barLabel}>{item.day}</span>
        </div>
      ))}
    </div>
  );
}

const DashboardPage = observer(function DashboardPage() {
  const auth = useAuthStore();
  const { data, loading } = useRequest<DashboardStats>(() => dashboardService.getStats());

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size={4}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            你好，{auth.nickname}
          </Typography.Title>
          <Typography.Text type="secondary">
            上次登录时间：{formatDate(new Date())} · 角色：
            {auth.userInfo?.roles.map((r) => (
              <Tag key={r} color="blue" style={{ marginInlineStart: 4 }}>
                {r}
              </Tag>
            ))}
          </Typography.Text>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {data?.cards.map((card) => (
          <Col key={card.key} xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title={card.title}
                value={card.value}
                suffix={card.unit}
                precision={card.unit === '元' ? 2 : 0}
                valueStyle={{
                  color: card.trend >= 0 ? '#cf1322' : '#3f8600',
                }}
              />
              <div className={styles.trend}>
                {card.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                <span>{Math.abs(card.trend)}%</span>
                <Typography.Text type="secondary">较昨日</Typography.Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="近 7 日访问趋势" loading={loading}>
            {data?.week ? <MiniBarChart data={data.week} /> : <Empty />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="待办事项" loading={loading}>
            <List
              dataSource={data?.todos ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#1677ff' }} />
                    <span>{item.text}</span>
                  </Space>
                  <Tag color={LEVEL_COLOR[item.level]}>
                    {item.level === 'high' ? '紧急' : item.level === 'normal' ? '常规' : '低频'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="数据概览" loading={loading}>
        <Typography.Text type="secondary">
          本周累计访问 {formatNumber(data?.week.reduce((s, i) => s + i.visits, 0) ?? 0, 0)} 次，
          累计下单 {formatNumber(data?.week.reduce((s, i) => s + i.orders, 0) ?? 0, 0)} 单。
        </Typography.Text>
      </Card>
    </Space>
  );
});

export default DashboardPage;
