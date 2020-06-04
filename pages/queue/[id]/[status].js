import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { useUser } from '../../../lib/auth/hooks';
import { Layout, Breadcrumb, Button, Typography, Table, Progress, message } from 'antd';
import { GithubFilled } from '@ant-design/icons';
import Sidebar from '../../../components/sidebar';

const ReactJson = dynamic(import('react-json-view'), { ssr: false });
const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const columns = [
  {
    title: 'Jobs',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: function ProgressCol(timestamp) {
      return <div>{moment(timestamp).calendar()}</div>;
    },
  },
  {
    title: 'Attempts',
    dataIndex: 'attemptsMade',
    key: 'attemptsMade',
  },
  {
    title: 'Progress',
    dataIndex: 'progress',
    key: 'progress',
    render: function ProgressCol(progress) {
      return <Progress percent={progress} />;
    },
  },
];

export default function JobStatus() {
  const user = useUser({ redirectTo: '/' });

  const router = useRouter();
  const { id, status } = router.query;

  const [jobStatus, setJobStatus] = useState({ jobs: [], count: 0 });
  const [jobStatusLoading, setJobStatusLoading] = useState(false);
  const fetchJobStatus = async (page, size) => {
    if (!id || !status) return;
    try {
      setJobStatusLoading(true);
      const res = await fetch(`/api/queue/${id}/${status}?page=${page}&size=${size}`);
      const { data, error } = await res.json();

      switch (res.status) {
        case 200:
          setJobStatus(data);
          break;
        default:
          throw new Error(error);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setJobStatusLoading(false);
    }
  };
  useEffect(() => {
    fetchJobStatus(1, 10);
  }, [user]);

  const onPageChange = (page, pageSize) => {
    fetchJobStatus(page, pageSize);
  };

  const onPageSizeChange = (page, pageSize) => {
    fetchJobStatus(page, pageSize);
  };

  const expandedRowRender = (record) => {
    return <ReactJson src={record} />;
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
                <Breadcrumb.Item>
                  <Link href={`/queue/${id}`}>
                    <a>{id}</a>
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{status}</Breadcrumb.Item>
              </Breadcrumb>
              <div className="dashboard-content__background">
                <div className="dashboard-overview-header">
                  <Title className="dashboard-overview-header__title" level={3}>
                    {status}
                  </Title>
                </div>
                <Table
                  rowKey="name"
                  loading={jobStatusLoading}
                  columns={columns}
                  expandable={{
                    expandedRowRender,
                  }}
                  dataSource={jobStatus.jobs}
                  pagination={{
                    total: jobStatus.count,
                    onChange: onPageChange,
                    onShowSizeChange: onPageSizeChange,
                  }}
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
        </Layout>
      )}
    </div>
  );
}
