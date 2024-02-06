import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Input, Tooltip, Select } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import router from '@/utils/history';
import { connect } from 'dva';
import { importAssetsPath } from '@/utils/importUtils';
import styles from './index.module.less';
import * as monaco from 'monaco-editor';
import moment from 'moment';
import _ from 'lodash';
import EchartExample from './components/echarts';
import { useMount } from 'ahooks';
import CodeEditor from './components/CodeEditor';
import { supportLanguages } from './components/CodeEditor/utils/configures';

function Dashboard(props) {
  const { count, dispatch } = props;
  const langList = supportLanguages;
  const [lang, setLang] = useState('javascript');
  return (
    <>
      <Card>
        <Typography.Paragraph>
          <h3>monaco-editor:</h3>
          langurage: <Select style={{width: 200}} value={lang} onChange={(val) => {
            setLang(val)
          }}>
            {langList.map((item) => (
              <Select.Option value={item} key={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
          <hr/>
          <CodeEditor lang={lang} />
        </Typography.Paragraph>
      </Card>
    </>
  );
}

export default connect(({ count }: any) => ({
  count,
}))(Dashboard);
