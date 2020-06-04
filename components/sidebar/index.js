import { useState } from 'react';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
import { BookOutlined, SettingOutlined } from '@ant-design/icons';

const { Sider } = Layout;

export default function Sidebar({ defaultSelected }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="dashboard-logo">
        <Link href="/">
          <a className="dashboard-logo__link">{collapsed ? '⏰' : 'ZeroQueue ⏰'}</a>
        </Link>
      </div>
      <Menu theme="dark" defaultSelectedKeys={[defaultSelected || null]} mode="inline">
        <Menu.Item key="overview">
          <Link href="/dashboard">
            <a className="dashboard-logo__link">
              <BookOutlined />
              <span>Overview</span>
            </a>
          </Link>
        </Menu.Item>
        <Menu.Item key="settings">
          <Link href="/settings">
            <a className="dashboard-logo__link">
              <SettingOutlined />
              <span>Settings</span>
            </a>
          </Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
