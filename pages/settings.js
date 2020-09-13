import { useState } from 'react';
import Head from 'next/head';
import { Layout, Breadcrumb, Button, Typography, Form, Input, message } from 'antd';
import { GithubFilled } from '@ant-design/icons';
import { useUser } from '../lib/auth/hooks';
import Sidebar from '../components/sidebar';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const layout = {
  labelCol: {
    span: 16,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    span: 16,
  },
};

export default function Settings() {
  const user = useUser({ redirectTo: '/' });

  const [userUpdateLoading, setUserUpdateLoading] = useState(false);
  const updateUser = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords don't match");
      return;
    }

    const body = {
      newUsername: values.newUsername || null,
      password: values.password,
      newPassword: values.newPassword || null,
    };

    try {
      setUserUpdateLoading(true);
      const res = await fetch(`/api/auth/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const { error } = await res.json();

      switch (res.status) {
        case 200:
          message.success('User updated successfully');
          break;
        default:
          throw new Error(error);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setUserUpdateLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  return (
    <div>
      <Head>
        <title>Zero Queue</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user && (
        <Layout className="dashboard-layout">
          <Sidebar defaultSelected={'settings'} />
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
                <Breadcrumb.Item>Settings</Breadcrumb.Item>
              </Breadcrumb>
              <div className="dashboard-content__background">
                <div className="dashboard-overview-header">
                  <Title className="dashboard-overview-header__title" level={4}>
                    Change username
                  </Title>
                </div>
                <Form
                  {...layout}
                  layout="vertical"
                  name="update-username"
                  initialValues={{ remember: true }}
                  onFinish={updateUser}
                  onFinishFailed={onFinishFailed}
                >
                  <Form.Item
                    label="New Username"
                    name="newUsername"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item {...tailLayout}>
                    <Button loading={userUpdateLoading} type="primary" htmlType="submit">
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <div className="dashboard-content__background">
                <div className="dashboard-overview-header">
                  <Title className="dashboard-overview-header__title" level={4}>
                    Change password
                  </Title>
                </div>
                <Form
                  {...layout}
                  layout="vertical"
                  name="update-password"
                  initialValues={{ remember: true }}
                  onFinish={updateUser}
                  onFinishFailed={onFinishFailed}
                >
                  <Form.Item
                    label="Current Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your current password!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[{ required: true, message: 'Please input your new password!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Please input your new password!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item {...tailLayout}>
                    <Button loading={userUpdateLoading} type="primary" htmlType="submit">
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              </div>
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
        </Layout>
      )}
    </div>
  );
}
