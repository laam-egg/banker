import { Button } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import React from "react";
import { Link } from "react-router-dom";

export function ButtonLink({
    to, type, children,
}: {
    to: string,
    type?: BaseButtonProps["type"],
    children: React.ReactNode,
}) {
    return <>
        <Link to={to}>
            <Button type={type}>
                {children}
            </Button>
        </Link>
    </>;
}
