import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Wrench, LogOut, ShoppingCart, Search, Star, TrendingUp, Loader2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAuth } from "../../../contexts/AuthContext";
import { getProducts, createOrder } from "../../../lib/products";
import type { Product } from "../../../lib/supabase";

interface CartItem {
  product: Product;
  quantity: number;
}

export function Shop() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const handleLogout = async () => { await signOut(); navigate("/"); };

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      await createOrder(
        cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
          price: c.product.price,
        }))
      );
      setCart([]);
      setShowCart(false);
      alert("Order placed successfully! Check your dashboard for order status.");
      navigate("/user/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Tech Service Portal
              </h1>
              <p className="text-xs text-gray-500">Hardware Shop</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="relative group"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-blue-600 to-purple-600">
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Link to="/user/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="w-96 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Cart ({cartCount})</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 border rounded-lg p-3">
                    <img
                      src={item.product.image_url ?? ""}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-blue-600 font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-600">₹{cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing Order...</>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-2">Premium Hardware Store</h2>
          <p className="text-xl text-blue-100">Browse quality components for all your tech needs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px] h-12">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="memory">Memory (RAM)</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col hover:shadow-xl transition-all border-2 hover:border-blue-500 group">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url ?? ""}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.trending && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                        {product.stock} in stock
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <div className="flex flex-col flex-1 p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1 font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex items-end justify-between mt-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{product.price}
                    </p>
                  </div>
                </div>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl text-gray-500">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
