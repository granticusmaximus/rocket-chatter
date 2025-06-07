import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
} from "reactstrap";

const AuthWrapper = ({ children }) => {
  return (
    <Container className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs="12" sm="8" md="6" lg="5">
          <Card className="shadow-sm">
            <CardBody className="text-center">
              <CardTitle tag="h1" className="mb-4">
                🚀 Rocket
              </CardTitle>
              {children}
              <div className="mt-4">
                <Link to="/login">
                  <Button color="primary" outline size="sm" className="me-2">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button color="primary" outline size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthWrapper;