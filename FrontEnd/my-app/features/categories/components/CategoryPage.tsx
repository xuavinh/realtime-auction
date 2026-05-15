"use client";

import { useState } from "react";
import { Card, Pagination, Row, Col } from "antd";

const { Meta } = Card;

interface Product {
    id: number;
    title: string;
    description: string;
    image: string;
}

interface Props {
    categoryName: string;
    products: Product[];

}

export default function CategoryPage({
    categoryName,
    products,
}: Props) {

    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 16;

    const startIndex = (currentPage - 1) * pageSize;

    const currentProducts = products.slice(
        startIndex,
        startIndex + pageSize
    );

    return (

        <div style={{ margin: "30px 108.4px" }}>

            <h1 style={{ marginBottom: 20 }}>{categoryName}</h1>

            <Row gutter={[24, 24]}>

                {
                    currentProducts.map((product) => (

                        <Col
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            key={product.id}
                        >

                            <Card
                                hoverable
                                cover={
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        style={{
                                            height: 400,
                                            objectFit: "cover",
                                        }}
                                    />
                                }
                            >

                                <Meta
                                    title={product.title}
                                    description={product.description}
                                />

                            </Card>

                        </Col>
                    ))
                }

            </Row>

            <div
                style={{
                    marginTop: 40,
                    display: "flex",
                    justifyContent: "center",
                }}
            >

                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={products.length}
                    onChange={(page) => setCurrentPage(page)}
                />

            </div>

        </div>
    );
}