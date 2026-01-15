import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/shared/ui/Card';
import { Heading, Text } from '@/shared/ui/Typography';
import { Spinner, Skeleton, Dots } from '@/shared/ui/Loading';
import { Alert } from '@/shared/ui/Alert';
import { Select } from '@/shared/ui/Select';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Radio, RadioGroup } from '@/shared/ui/Radio';
import { TextArea } from '@/shared/ui/TextArea';

export const ComponentShowcase = () => {
    const [showAlert, setShowAlert] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Heading level={1} className="mb-2">
                    UI Components Library
                </Heading>
                <Text size="lg" color="muted" className="mb-8">
                    Complete showcase of all available components
                </Text>

                {/* Buttons */}
                <Card className="mb-8">
                    <CardHeader>
                        <Heading level={2}>Buttons</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            <div>
                                <Heading level={4} className="mb-3">Variants</Heading>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="accent">Accent</Button>
                                    <Button variant="danger">Danger</Button>
                                    <Button variant="ghost">Ghost</Button>
                                </div>
                            </div>

                            <div>
                                <Heading level={4} className="mb-3">Sizes</Heading>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </div>

                            <div>
                                <Heading level={4} className="mb-3">States</Heading>
                                <div className="flex flex-wrap gap-3">
                                    <Button>Normal</Button>
                                    <Button disabled>Disabled</Button>
                                    <Button loading>Loading</Button>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Typography */}
                <Card className="mb-8">
                    <CardHeader>
                        <Heading level={2}>Typography</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div>
                                <Heading level={1}>Heading 1</Heading>
                                <Heading level={2}>Heading 2</Heading>
                                <Heading level={3}>Heading 3</Heading>
                                <Heading level={4}>Heading 4</Heading>
                                <Heading level={5}>Heading 5</Heading>
                                <Heading level={6}>Heading 6</Heading>
                            </div>
                            <div>
                                <Text size="xl">Extra Large Text</Text>
                                <Text size="lg">Large Text</Text>
                                <Text size="base">Base Text</Text>
                                <Text size="sm">Small Text</Text>
                                <Text size="xs">Extra Small Text</Text>
                            </div>
                            <div>
                                <Text color="primary">Primary Color</Text>
                                <Text color="secondary">Secondary Color</Text>
                                <Text color="neutral">Neutral Color</Text>
                                <Text color="muted">Muted Color</Text>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Loading */}
                <Card className="mb-8">
                    <CardHeader>
                        <Heading level={2}>Loading States</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            <div>
                                <Heading level={4} className="mb-3">Spinners</Heading>
                                <div className="flex items-center gap-6">
                                    <Spinner size="sm" />
                                    <Spinner size="md" />
                                    <Spinner size="lg" />
                                    <Spinner size="xl" />
                                </div>
                            </div>

                            <div>
                                <Heading level={4} className="mb-3">Skeleton</Heading>
                                <div className="space-y-2 max-w-md">
                                    <Skeleton width="100%" height="2rem" />
                                    <Skeleton width="80%" height="1rem" />
                                    <Skeleton width="60%" height="1rem" />
                                </div>
                            </div>

                            <div>
                                <Heading level={4} className="mb-3">Dots</Heading>
                                <div className="flex items-center gap-6">
                                    <Dots size="sm" />
                                    <Dots size="md" />
                                    <Dots size="lg" />
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Alerts */}
                <Card className="mb-8">
                    <CardHeader>
                        <Heading level={2}>Alerts</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <Alert
                                variant="success"
                                title="Success"
                                description="Your changes have been saved successfully."
                            />
                            <Alert
                                variant="warning"
                                title="Warning"
                                description="Please review your information before proceeding."
                            />
                            <Alert
                                variant="error"
                                title="Error"
                                description="An error occurred while processing your request."
                            />
                            <Alert
                                variant="info"
                                title="Information"
                                description="This is an informational message."
                                dismissible
                                onClose={() => console.log('Alert dismissed')}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Form Components */}
                <Card className="mb-8">
                    <CardHeader>
                        <Heading level={2}>Form Components</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6 max-w-2xl">
                            {/* Inputs */}
                            <div>
                                <Heading level={4} className="mb-3">Inputs</Heading>
                                <div className="space-y-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="you@example.com"
                                        helperText="We'll never share your email"
                                    />
                                    <Input
                                        label="Password"
                                        type="password"
                                        error="Password must be at least 8 characters"
                                    />
                                </div>
                            </div>

                            {/* Select */}
                            <div>
                                <Heading level={4} className="mb-3">Select</Heading>
                                <Select
                                    label="Country"
                                    placeholder="Select a country"
                                    options={[
                                        { value: 'us', label: 'United States' },
                                        { value: 'br', label: 'Brazil' },
                                        { value: 'uk', label: 'United Kingdom' },
                                    ]}
                                    helperText="Choose your country"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div>
                                <Heading level={4} className="mb-3">Checkboxes</Heading>
                                <div className="space-y-2">
                                    <Checkbox
                                        label="I agree to the terms and conditions"
                                        id="terms"
                                    />
                                    <Checkbox
                                        label="Subscribe to newsletter"
                                        id="newsletter"
                                        helperText="Get weekly updates"
                                    />
                                    <Checkbox
                                        label="Disabled checkbox"
                                        id="disabled-check"
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Radio */}
                            <div>
                                <Heading level={4} className="mb-3">Radio Buttons</Heading>
                                <RadioGroup label="Preferred contact method">
                                    <Radio
                                        label="Email"
                                        name="contact"
                                        value="email"
                                        id="contact-email"
                                    />
                                    <Radio
                                        label="Phone"
                                        name="contact"
                                        value="phone"
                                        id="contact-phone"
                                    />
                                    <Radio
                                        label="SMS"
                                        name="contact"
                                        value="sms"
                                        id="contact-sms"
                                    />
                                </RadioGroup>
                            </div>

                            {/* TextArea */}
                            <div>
                                <Heading level={4} className="mb-3">TextArea</Heading>
                                <TextArea
                                    label="Message"
                                    placeholder="Enter your message..."
                                    rows={4}
                                    helperText="Maximum 500 characters"
                                    maxLength={500}
                                    showCount
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Cards */}
                <div className="mb-8">
                    <Heading level={2} className="mb-4">Cards</Heading>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <Heading level={4}>Default Card</Heading>
                            </CardHeader>
                            <CardBody>
                                <Text color="muted">
                                    This is a default card with shadow.
                                </Text>
                            </CardBody>
                            <CardFooter>
                                <Button size="sm" fullWidth>Action</Button>
                            </CardFooter>
                        </Card>

                        <Card variant="outlined">
                            <CardHeader>
                                <Heading level={4}>Outlined Card</Heading>
                            </CardHeader>
                            <CardBody>
                                <Text color="muted">
                                    This is an outlined card with border.
                                </Text>
                            </CardBody>
                            <CardFooter>
                                <Button size="sm" variant="secondary" fullWidth>Action</Button>
                            </CardFooter>
                        </Card>

                        <Card variant="elevated" hoverable>
                            <CardHeader>
                                <Heading level={4}>Elevated Card</Heading>
                            </CardHeader>
                            <CardBody>
                                <Text color="muted">
                                    This is an elevated hoverable card.
                                </Text>
                            </CardBody>
                            <CardFooter>
                                <Button size="sm" variant="accent" fullWidth>Action</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* Color Palette */}
                <Card>
                    <CardHeader>
                        <Heading level={2}>Color Palette</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="h-20 bg-[#003B5C] rounded mb-2"></div>
                                <Text weight="medium">Primary</Text>
                                <Text size="xs" color="muted">#003B5C</Text>
                            </div>
                            <div>
                                <div className="h-20 bg-[#0066CC] rounded mb-2"></div>
                                <Text weight="medium">Secondary</Text>
                                <Text size="xs" color="muted">#0066CC</Text>
                            </div>
                            <div>
                                <div className="h-20 bg-[#F2C94C] rounded mb-2"></div>
                                <Text weight="medium">Accent</Text>
                                <Text size="xs" color="muted">#F2C94C</Text>
                            </div>
                            <div>
                                <div className="h-20 bg-red-600 rounded mb-2"></div>
                                <Text weight="medium">Danger</Text>
                                <Text size="xs" color="muted">#DC2626</Text>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};
