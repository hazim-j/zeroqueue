import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Layout,
  Breadcrumb,
  Button,
  Typography,
  Table,
  message,
  Tag,
  Upload,
  Modal,
  Dropdown,
  Menu,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  GithubFilled,
  InboxOutlined,
  DownOutlined,
  ApiOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useUser } from '../../lib/auth/hooks';
import Sidebar from '../../components/sidebar';
import { InstallDependencies, Worker } from '../../components/codesnippets';

const { Title } = Typography;
const { Header, Content, Footer } = Layout;
const { Dragger } = Upload;

const STATUS_COL_MAP = {
  waiting: 'blue',
  active: 'blue',
  completed: 'green',
  failed: 'red',
  delayed: 'orange',
  paused: 'orange',
};

const DROPDOWN_KEYS = {
  CODE_SAMPLE: 'CODE_SAMPLE',
};

const columns = (id) => [
  {
    title: 'Status',
    dataIndex: 'name',
    key: 'name',
    render: function StatusCol(text) {
      return (
        <Link href={`/queue/${id}/${text}`}>
          <a>{text}</a>
        </Link>
      );
    },
  },
  {
    title: 'Count',
    dataIndex: 'value',
    key: 'value',
    render: function CountCol(count, record) {
      return (
        <span>
          <Tag color={STATUS_COL_MAP[record.name] || null}>{count}</Tag>
        </span>
      );
    },
  },
];

const uploadProps = (setJobs) => ({
  beforeUpload: (file) =>
    new Promise((resolve, reject) => {
      if (file.type !== 'application/json') {
        message.error('Invalid file type. Expected a .json file');
        reject(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        setJobs(ev.target.result);
        resolve(true);
      };
      reader.onerror = () => {
        reader.abort();
        message.error('Could not read file');
        reject(false);
      };

      reader.readAsText(file);
    }),
});

export default function Queue() {
  const user = useUser({ redirectTo: '/' });

  const router = useRouter();
  const { id } = router.query;

  const [queue, setQueue] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        if (!user) return;

        setLoadingQueue(true);
        const res = await fetch(`/api/queue/${id}`);
        const { data, error } = await res.json();

        switch (res.status) {
          case 200:
            setQueue(data);
            break;
          default:
            throw new Error(error);
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoadingQueue(false);
      }
    };
    fetchQueue();
  }, [user]);

  const [showNewJobsForm, setShowNewJobsForm] = useState(false);
  const [jobs, setJobs] = useState(null);
  const [loadingAddJobs, setLoadingAddJobs] = useState(false);
  const onAddJob = async () => {
    try {
      if (!user) return;

      setLoadingAddJobs(true);
      const res = await fetch(`/api/queue/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jobs,
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
      setLoadingAddJobs(false);
    }
  };

  const [showWorkerCodeSample, setShowWorkerCodeSample] = useState(false);
  const onDropdownClick = ({ key }) => {
    switch (key) {
      case DROPDOWN_KEYS.CODE_SAMPLE:
        return setShowWorkerCodeSample(true);
      default:
        break;
    }
  };

  const queueName = () => (queue && queue.name) || '...';

  const [redis, setRedis] = useState(null);
  const [loadingSecret, setLoadingSecret] = useState(null);
  const onShowSecret = async (checked) => {
    if (!checked) return setRedis(null);

    try {
      if (!user) return;

      setLoadingSecret(true);
      const res = await fetch(`/api/config`);
      const { data, error } = await res.json();

      switch (res.status) {
        case 200:
          setRedis(data.REDIS_URL);
          break;
        default:
          throw new Error(error);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoadingSecret(false);
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
          <Sidebar />
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
                <Breadcrumb.Item>
                  <Link href={`/dashboard`}>
                    <a>Queue</a>
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{id}</Breadcrumb.Item>
              </Breadcrumb>
              <div className="dashboard-content__background">
                <div className="dashboard-overview-header">
                  <Title className="dashboard-overview-header__title" level={3}>
                    {queueName()}
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowNewJobsForm(true)}
                  >
                    New Jobs
                  </Button>
                  <Dropdown
                    overlay={
                      <Menu onClick={onDropdownClick}>
                        <Menu.Item key={DROPDOWN_KEYS.CODE_SAMPLE}>
                          <ApiOutlined /> Code sample
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button className="dashboard-overview-header__last-button">
                      More <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
                <Table
                  rowKey="name"
                  loading={loadingQueue}
                  columns={columns(id)}
                  dataSource={(queue && queue.status) || []}
                />
              </div>
            </Content>
            <Footer className="dashboard-footer">
              <Button type="link" href="https://zeroqueue.dev" target="blank">
                ZeroQueue
              </Button>
              <Button
                type="link"
                href="https://github.com/thezeroqueue/zeroqueue"
                target="blank"
                icon={<GithubFilled />}
              />
            </Footer>
          </Layout>
          <Modal
            title="Add new jobs"
            visible={showNewJobsForm}
            onCancel={() => setShowNewJobsForm(false)}
            footer={null}
          >
            <Dragger {...uploadProps(setJobs)}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag JSON file to this area to upload</p>
              <p className="ant-upload-hint">See docs to learn more...</p>
            </Dragger>
            <br />
            <Button
              loading={loadingAddJobs}
              disabled={!jobs}
              type="primary"
              block
              onClick={onAddJob}
            >
              Add Jobs
            </Button>
          </Modal>
          <Modal
            title="Worker code sample"
            width="45%"
            visible={showWorkerCodeSample}
            onCancel={() => setShowWorkerCodeSample(false)}
            footer={null}
          >
            <p>Install dependencies:</p>
            <InstallDependencies />
            <div className="modal-switch-container">
              <p>Use the following template:</p>
              <p>
                <Switch
                  unCheckedChildren={<EyeInvisibleOutlined />}
                  loading={loadingSecret}
                  onChange={onShowSecret}
                />
              </p>
            </div>
            <Worker queue={queueName()} redis={redis} />
          </Modal>
        </Layout>
      )}
    </div>
  );
}
