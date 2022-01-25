import React from "react"
import { Container,Row, Col, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";
function Home() {
    return (
        <Container fluid>
            <Row style={{textAlign:"center",verticalAlign: "middle",padding:"35vh 5vw 0px 5vw"}}>
            <Col></Col>
            <Col xs={6}>
                <h1>Surfboard Meetings</h1>
                <Link to={"/"+(Math.random() + 1).toString(36).substring(2)} state={{admin:true}}>
                    <Button variant="outline-primary">
                        Create New Meeting
                    </Button>
                </Link>
            </Col>
            <Col></Col>
            </Row>
        </Container>
    )
}

export default Home