import { useState, useEffect } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import Link from 'next/link';
import {
  Layout,
  Breadcrumb,
  Button,
  Typography,
  Table,
  message,
  Modal,
  Form,
  Input,
  Tabs,
  Spin,
  Popconfirm,
} from 'antd';
import { PlusOutlined, GithubFilled } from '@ant-design/icons';
import { isValidCron } from 'cron-validator';
import cronstrue from 'cronstrue';
import moment from 'moment';
import { useUser } from '../lib/auth/hooks';
import Sidebar from '../components/sidebar';

const { Title } = Typography;
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

const queuesColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: function NameCol(text, record) {
      return (
        <Link href={`/queue/${record.id}`}>
          <a>{text}</a>
        </Link>
      );
    },
  },
  {
    title: 'Schedule',
    dataIndex: 'schedule',
    key: 'schedule',
    render: function ScheduleCol(text) {
      return <div>{(text && cronstrue.toString(text)) || 'Schedule not set'}</div>;
    },
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: function CreatedCol(createdAt) {
      return <div>{moment(createdAt).calendar()}</div>;
    },
  },
  {
    title: 'Action',
    key: 'action',
    render: function ActionCol(_, record) {
      const ActionColWrapper = () => {
        const [queueActionLoading, setQueueActionLoading] = useState(false);

        const onFlush = async () => {
          try {
            setQueueActionLoading(true);
            const res = await fetch(`api/queue/${record.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'flush' }),
            });
            const { error } = await res.json();

            switch (res.status) {
              case 200:
                message.success('Queue flushed successfully');
                break;
              default:
                throw new Error(error);
            }
          } catch (error) {
            message.error(error.message);
          } finally {
            setQueueActionLoading(false);
          }
        };

        const onDelete = async () => {
          try {
            setQueueActionLoading(true);
            const res = await fetch(`api/queue/${record.id}`, {
              method: 'DELETE',
            });
            const { error } = await res.json();

            switch (res.status) {
              case 200:
                location.reload();
                break;
              default:
                throw new Error(error);
            }
          } catch (error) {
            message.error(error.message);
          } finally {
            setQueueActionLoading(false);
          }
        };

        return (
          <div>
            {queueActionLoading ? (
              <Spin />
            ) : (
              [
                <Popconfirm
                  key="actionCol_flush"
                  title="Are you sure you want to flush this queue?"
                  onConfirm={onFlush}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link">Flush</Button>
                </Popconfirm>,
                <Popconfirm
                  key="actionCol_delete"
                  title="Are you sure you want to delete this queue?"
                  onConfirm={onDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link">Delete</Button>
                </Popconfirm>,
              ]
            )}
          </div>
        );
      };

      return <ActionColWrapper />;
    },
  },
];

const redisColumns = [
  {
    title: 'Stat',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  },
];

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

export default function Dashboard() {
  const user = useUser({ redirectTo: '/' });

  const [showNewQueueForm, setShowNewQueueForm] = useState(false);
  const [newQueueLoading, setNewQueueLoading] = useState(false);

  const [queues, setQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        if (!user) return;

        setLoadingQueues(true);
        const res = await fetch(`/api/queue`);
        const { data, error } = await res.json();

        switch (res.status) {
          case 200:
            setQueues(data);
            break;
          default:
            throw new Error(error);
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoadingQueues(false);
      }
    };
    fetchQueues();
  }, [user]);

  const [redis, setRedis] = useState([]);
  const [loadingRedis, setLoadingRedis] = useState(false);
  useEffect(() => {
    const fetchRedis = async () => {
      try {
        if (!user) return;

        setLoadingRedis(true);
        const res = await fetch(`/api/queue/redis`);
        const { data, error } = await res.json();

        switch (res.status) {
          case 200:
            setRedis(data);
            break;
          default:
            throw new Error(error);
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoadingRedis(false);
      }
    };
    fetchRedis();
  }, [user]);

  const onFinishFailed = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  const onFinish = async (values) => {
    const body = {
      name: values.name,
      schedule: values.schedule,
    };

    try {
      setNewQueueLoading(true);
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const { data, error } = await res.json();

      switch (res.status) {
        case 200:
          message.success('New queue successful');
          Router.push(`/queue/${data.id}`);
          break;
        default:
          throw new Error(error);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setNewQueueLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Zero Queue</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user && (
        <Layout className="dashboard-layout">
          <Sidebar defaultSelected={'overview'} />
          <Layout className="dashboard-layout">
            <Header className="dashboard-header">
              <div className="dashboard-header__space" />
              <Button type="link" href="/api/auth/logout">
                Logout
              </Button>
            </Header>
            <Content className="dashboard-content">
              <Breadcrumb className="dashboard-content__breadcrumb">
                <Breadcrumb.Item>ZeroQueue</Breadcrumb.Item>
                <Breadcrumb.Item>Overview</Breadcrumb.Item>
              </Breadcrumb>
              <Tabs className="dashboard-content__tabs" defaultActiveKey="queues" type="card">
                <TabPane tab="Queues" key="queues">
                  <div className="dashboard-content__background">
                    <div className="dashboard-overview-header">
                      <Title className="dashboard-overview-header__title" level={3}>
                        All Queues
                      </Title>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setShowNewQueueForm(true)}
                      >
                        New Queue
                      </Button>
                    </div>
                    <Table
                      rowKey="id"
                      loading={loadingQueues}
                      columns={queuesColumns}
                      dataSource={queues}
                    />
                  </div>
                </TabPane>
                <TabPane tab="Redis" key="redis">
                  <div className="dashboard-content__background">
                    <div className="dashboard-overview-header">
                      <Title className="dashboard-overview-header__title" level={3}>
                        Redis Statistics
                      </Title>
                    </div>
                    <Table
                      rowKey="name"
                      loading={loadingRedis}
                      columns={redisColumns}
                      dataSource={redis}
                    />
                  </div>
                </TabPane>
              </Tabs>
            </Content>
            <Footer className="dashboard-footer">
              <Button
                type="link"
                href="https://github.com/thezeroqueue/zeroqueue"
                target="blank"
                icon={<GithubFilled />}
              />
            </Footer>
          </Layout>
          <Modal
            title="Create a new queue"
            visible={showNewQueueForm}
            onCancel={() => setShowNewQueueForm(false)}
            footer={null}
          >
            <Form
              {...layout}
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input your queue name!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Schedule (cron)"
                name="schedule"
                rules={[
                  () => ({
                    validator(_, value) {
                      if (value && !isValidCron(value)) {
                        return Promise.reject('Please input a valid cron!');
                      }

                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button loading={newQueueLoading} type="primary" htmlType="submit">
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      )}
    </div>
  );
}
