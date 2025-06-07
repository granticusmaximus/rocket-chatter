import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";

export default function RegisterForm() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(email, password);
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Failed to create account");
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h2 className="mb-4">Register</h2>
            {error && <Alert color="danger">{error}</Alert>}
            <FormGroup>
                <Label for="registerEmail">Email</Label>
                <Input
                    id="registerEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </FormGroup>
            <FormGroup>
                <Label for="registerPassword">Password</Label>
                <Input
                    id="registerPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </FormGroup>
            <FormGroup>
                <Label for="registerConfirm">Confirm Password</Label>
                <Input
                    id="registerConfirm"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />
            </FormGroup>
            <Button color="primary" type="submit">Register</Button>
            <p className="mt-3">
                Already have an account? <a href="/login">Log in</a>
            </p>
        </Form>
    );
}