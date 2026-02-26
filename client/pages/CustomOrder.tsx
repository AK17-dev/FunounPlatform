import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import {
  createCustomOrder,
  CUSTOM_ORDER_PRODUCT_TYPES,
  type CustomOrderProductType,
} from "@/lib/customOrders";

interface CustomOrderFormState {
  name: string;
  phone: string;
  product_type: CustomOrderProductType;
  quantity: number;
  colors: string;
  custom_text: string;
  notes: string;
}

const initialFormState: CustomOrderFormState = {
  name: "",
  phone: "",
  product_type: "Cup",
  quantity: 1,
  colors: "",
  custom_text: "",
  notes: "",
};

export default function CustomOrder() {
  const [formData, setFormData] = useState<CustomOrderFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, Number(value) || 1) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your full name and phone number.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity < 1) {
      toast({
        title: "Invalid quantity",
        description: "Quantity must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const order = await createCustomOrder(formData);

      setTrackingCode(order.tracking_code);
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error submitting custom order:", error);
      toast({
        title: "Submit failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-3xl mx-auto handmade-shadow">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Custom Order Request</CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                Tell us what you want and we will craft it for you.
              </p>
            </CardHeader>
            <CardContent>
              {trackingCode ? (
                <div className="space-y-6 text-center py-8">
                  <h2 className="font-serif text-2xl font-semibold">
                    Your request was sent successfully!
                  </h2>
                  <div className="bg-muted rounded-lg py-4 px-6">
                    <p className="text-sm text-muted-foreground">Tracking Code:</p>
                    <p className="text-2xl font-bold tracking-wide text-primary">
                      {trackingCode}
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    Save this code to check your order status later.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => setTrackingCode(null)}>
                      Submit Another Request
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/">Back to Home</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +961 76 000 000"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product_type">Product Type *</Label>
                      <Select
                        value={formData.product_type}
                        onValueChange={(value: CustomOrderProductType) =>
                          setFormData((prev) => ({ ...prev, product_type: value }))
                        }
                      >
                        <SelectTrigger id="product_type">
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOM_ORDER_PRODUCT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min={1}
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colors">Preferred Colors</Label>
                    <Input
                      id="colors"
                      name="colors"
                      value={formData.colors}
                      onChange={handleInputChange}
                      placeholder="e.g. light pink, white, gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_text">Text to write on product</Label>
                    <Input
                      id="custom_text"
                      name="custom_text"
                      value={formData.custom_text}
                      onChange={handleInputChange}
                      placeholder="e.g. Fatima, Happy Birthday"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any extra details for your custom order..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
