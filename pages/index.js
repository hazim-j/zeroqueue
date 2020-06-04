import { useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { Layout, Card, Typography, Form, Input, Button, Checkbox, message } from 'antd';
import { GithubFilled } from '@ant-design/icons';
import { useUser } from '../lib/auth/hooks';

const { Title, Paragraph } = Typography;
const { Footer } = Layout;

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

export default function Home() {
  useUser({ redirectTo: '/dashboard', redirectIfFound: true });
  const [loading, setLoading] = useState(false);

  const onFinishFailed = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  const onFinish = async (values) => {
    const body = {
      username: values.username,
      password: values.password,
      remember: values.remember,
    };

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const { error } = await res.json();

      switch (res.status) {
        case 200:
          message.success('Login successful');
          Router.push('/dashboard');
          break;
        default:
          throw new Error(error);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Zero Queue</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout className="home-body">
        <Title className="login-header" level={1} code>
          ZeroQueue
        </Title>
        <Paragraph className="login-sub-header">⏰ A low-code queue management system ⏰</Paragraph>
        <Card className="login-card">
          <Paragraph className="login-card__header">Log into your account</Paragraph>
          <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Username"
              name="username"
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

            <Form.Item {...tailLayout} name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button loading={loading} type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
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
    </div>
  );
}
