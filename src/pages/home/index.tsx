import { Button, Col, Row } from "antd";

import {
  Link,
} from "react-router-dom";

export default function Home() {
  return (
    <Row gutter={24}>
      <Col span={12}>
        <h1>{"Tools by Vũ Tùng Lâm 22028235 UET"}</h1>
        <Link to="/banker">
          <Button type="primary">
            Banker
          </Button>
        </Link>
      </Col>
    </Row>
  );
}