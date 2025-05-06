import { Col, Row } from "antd";
import { ButtonLink } from "../../components/ButtonLink";

export default function Home() {
  return (
    <Row gutter={24}>
      <Col span={12}>
        <h1>{"Tools by Vũ Tùng Lâm 22028235 UET"}</h1>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <ButtonLink to="https://cpu-scheduling-two.vercel.app/" type="default" target="_blank">
            {"CPU scheduling (by Nguyễn Văn Nhất)"}
          </ButtonLink>
          <ButtonLink to="/banker" type="primary">{"Banker"}</ButtonLink>
          <ButtonLink to="/page_replacement" type="primary">{"Thuật toán thay thế trang"}</ButtonLink>
          <ButtonLink to="/hdd_scheduling" type="primary">{"Lập lịch đĩa HDD"}</ButtonLink>
        </div>
      </Col>
    </Row>
  );
}
