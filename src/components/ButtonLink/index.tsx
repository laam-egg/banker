import { Button } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import React from "react";
import { Link } from "react-router-dom";

export function ButtonLink({
    to, type, children, target,
}: {
    to: string,
    type?: BaseButtonProps["type"],
    children: React.ReactNode,
    target?: string,
}) {
    return <>
        <Link to={to} target={target}>
            <Button type={type}>
                {children}
            </Button>
        </Link>
    </>;
}
