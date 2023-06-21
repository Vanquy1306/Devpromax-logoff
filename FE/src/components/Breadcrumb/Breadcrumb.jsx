import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Breadcrumb.scss";

const BreadcrumbComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathnames = location.pathname.split("/").filter((x) => x);

    const new_pathnames = pathnames.map(
      (item) => item.charAt(0).toLocaleUpperCase() + item.slice(1)
    );

    const breadcrumb = pathnames.map((_, index) => {
      const pathname = pathnames.slice(0, index + 1);
      const url = `/${pathname.join("/")}`;
      return (
        <Breadcrumb.Item key={url} onClick={() => navigate(url)}>
          <span>{new_pathnames[index]}</span>
        </Breadcrumb.Item>
      );
    });

    setBreadcrumbs(breadcrumb);
    
  }, [location, navigate]);

  return (
    <Row className="breadcrumb__container">
      <Breadcrumb>
        <Breadcrumb.Item onClick={() => navigate('/')}>
          <HomeOutlined />
        </Breadcrumb.Item>
        {breadcrumbs}
      </Breadcrumb>
    </Row>
  );
};

export default BreadcrumbComponent;
