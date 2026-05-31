import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Wrench, LogOut, ShoppingCart, Search, Star, TrendingUp, Loader2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAuth } from "../../../contexts/AuthContext";
import { getProducts, createOrder, getProductReviews, addProductReview } from "../../../lib/products";
import type { Product, ProductReview } from "../../../lib/supabase";

interface CartItem {
  product: Product;
  quantity: number;
}

export function Shop() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const openProductDetails = async (product: Product) => {
    setSelectedProduct(product);
    setReviews([]);
    setLoadingReviews(true);
    setActiveTab("description");
    setNewRating(0);
    setHoverRating(0);
    setNewComment("");
    try {
      const data = await getProductReviews(product.id);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || newRating === 0 || !newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = await addProductReview(selectedProduct.id, newRating, newComment.trim());
      setReviews((prev) => [newReview, ...prev]);
      
      const updatedReviews = [newReview, ...reviews];
      const newAvg = Math.round((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10) / 10;
      
      setSelectedProduct((prev) => prev ? {
        ...prev,
        rating: newAvg,
        reviews: updatedReviews.length
      } : null);

      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, rating: newAvg, reviews: updatedReviews.length }
            : p
        )
      );

      setNewRating(0);
      setNewComment("");
      alert("Thank you for your feedback! Your review has been submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

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
    if (cart.length === 0 || !deliveryAddress.trim()) return;
    setCheckingOut(true);
    try {
      await createOrder(
        cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
          price: c.product.price,
        })),
        deliveryAddress.trim()
      );
      setCart([]);
      setDeliveryAddress("");
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
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Smart Tech Logo" className="w-18 h-18 object-contain" />
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
              <div className="p-6 border-t space-y-4">
                <div className="space-y-2">
                  <label htmlFor="delivery-address" className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                    Delivery Address *
                  </label>
                  <textarea
                    id="delivery-address"
                    rows={3}
                    placeholder="Enter full shipping address with PIN code..."
                    className="w-full text-sm border-2 rounded-lg p-2.5 outline-none focus:border-blue-500 hover:border-gray-300 transition-all bg-gray-50/50 resize-none font-sans"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                  {!deliveryAddress.trim() && (
                    <p className="text-xs text-red-500 font-medium">
                      Please enter a delivery address to complete order.
                    </p>
                  )}
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-600">₹{cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleCheckout}
                  disabled={checkingOut || !deliveryAddress.trim()}
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
                  <div className="relative overflow-hidden cursor-pointer" onClick={() => openProductDetails(product)}>
                    <img
                      src={product.image_url ?? ""}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1 shadow-lg">
                        <Search className="w-3.5 h-3.5" />
                        View Details
                      </span>
                    </div>
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
                  <CardTitle
                    className="text-lg mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => openProductDetails(product)}
                  >
                    {product.name}
                  </CardTitle>
                  <div
                    className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openProductDetails(product)}
                  >
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
                <CardFooter className="p-4 pt-0 gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-gray-50 font-medium"
                    onClick={() => openProductDetails(product)}
                  >
                    Details
                  </Button>
                  <Button
                    className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
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

      {/* Product Details Drawer/Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-scale-up">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md rounded-full shadow hover:bg-gray-100"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="w-5 h-5 text-gray-700" />
            </Button>

            {/* Left Side: Image & Meta */}
            <div className="w-full md:w-1/2 bg-gray-100/50 flex flex-col p-6 justify-center border-r">
              <div className="relative rounded-xl overflow-hidden shadow-md max-h-[300px] md:max-h-[400px] mb-4">
                <img
                  src={selectedProduct.image_url ?? ""}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                {selectedProduct.trending && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 text-blue-800 border-none px-2.5 py-1 text-xs font-semibold capitalize">
                    {selectedProduct.category}
                  </Badge>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    selectedProduct.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} In Stock` : 'Out of Stock'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(selectedProduct.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm ml-1.5 font-bold text-gray-800">{selectedProduct.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400 border-l pl-2">
                    {selectedProduct.reviews} {selectedProduct.reviews === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md flex items-center gap-2"
                    onClick={() => {
                      addToCart(selectedProduct);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side: Tabbed Details & Reviews */}
            <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-auto max-h-[90vh]">
              {/* Tab headers */}
              <div className="flex border-b">
                <button
                  type="button"
                  className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'description'
                      ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  type="button"
                  className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews & Ratings ({selectedProduct.reviews})
                </button>
              </div>

              {/* Tab contents */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'description' && (
                  <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                    <p>
                      {getDescriptionText(selectedProduct.name)}
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider">Specifications</h4>
                      <dl className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div>
                          <dt className="text-gray-400 text-xs">Category</dt>
                          <dd className="font-semibold text-gray-800 text-xs capitalize">{selectedProduct.category}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400 text-xs">Warranty</dt>
                          <dd className="font-semibold text-gray-800 text-xs">1 Year Brand Warranty</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400 text-xs">Stock Level</dt>
                          <dd className="font-semibold text-gray-800 text-xs">{selectedProduct.stock} Available</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400 text-xs">Availability</dt>
                          <dd className="font-semibold text-gray-800 text-xs">Immediate Dispatch</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider">Key Features</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>High-quality materials and rigorous testing for reliability.</li>
                        <li>Industry-grade compatibility with standard motherboards and platforms.</li>
                        <li>Designed for power efficiency and thermal cooling optimization.</li>
                        <li>Certified genuine product with retail packing.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Aggregated ratings breakdown */}
                    <div className="flex items-center gap-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="text-center">
                        <div className="text-4xl font-extrabold text-gray-900">{selectedProduct.rating}</div>
                        <div className="flex justify-center my-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= Math.round(selectedProduct.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Average Rating</div>
                      </div>

                      {/* Progress bars for rating breakdown */}
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-right font-medium text-gray-600">{stars}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-7 text-right text-gray-400 text-[10px]">{Math.round(pct)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Write Review Form */}
                    <div className="border-t pt-4">
                      {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4 bg-blue-50/20 rounded-xl p-4 border border-blue-500/10">
                          <h4 className="font-bold text-sm text-gray-900">Write a Review</h4>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              Your Rating
                            </label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                  onClick={() => setNewRating(star)}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                >
                                  <Star
                                    className={`w-6 h-6 transition-colors ${
                                      star <= (hoverRating || newRating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="review-comment" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              Your Feedback
                            </label>
                            <textarea
                              id="review-comment"
                              rows={3}
                              className="w-full text-sm border rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-sans"
                              placeholder="Share your experience with this product..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              required
                            />
                          </div>

                          <Button
                            type="submit"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 font-semibold"
                            disabled={submittingReview || newRating === 0}
                          >
                            {submittingReview ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Submitting...</>
                            ) : (
                              "Submit Review"
                            )}
                          </Button>
                        </form>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed">
                          <p className="text-sm text-gray-500">Please sign in to write a review.</p>
                          <Link to="/login" className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline">
                            Login Now
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Reviews Feed */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-gray-900 border-b pb-2 flex justify-between items-center">
                        <span>Customer Reviews</span>
                        <span className="text-xs font-normal text-gray-400">Showing {reviews.length} reviews</span>
                      </h4>

                      {loadingReviews ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                      ) : reviews.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-6">No reviews yet. Be the first to write one!</p>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {reviews.map((rev) => (
                            <div key={rev.id} className="border-b pb-4 last:border-b-0 space-y-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-sm text-gray-800">{rev.full_name}</span>
                                  <span className="text-[10px] text-gray-400 ml-2">
                                    {new Date(rev.created_at).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= rev.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed font-sans">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDescriptionText(name: string): string {
  if (name.includes("RAM")) {
    return "Upgrade your system performance with this high-speed, reliable desktop memory module. Engineered for maximum bandwidth and optimized response times, this RAM enables seamless multitasking, faster file rendering, and smoother gameplay. Built with premium-quality chips and fully tested for compatibility across major Intel and AMD systems.";
  }
  if (name.includes("SSD")) {
    return "Experience lightning-fast boot times, file transfers, and application loads with this high-performance Solid State Drive. Leveraging advanced NVMe PCIe technology, it delivers sequential read and write speeds that outperform standard SATA drives. Durable, power-efficient, and silent, this SSD is the ultimate upgrade for creators, gamers, and professionals alike.";
  }
  if (name.includes("Mouse")) {
    return "Take control of your workflow with this premium ergonomic mouse. Featuring customizable buttons, high-precision optical tracking, and comfortable scroll wheel, it's designed to reduce hand strain and increase productivity. Enjoy long battery life and seamless wireless connectivity across multiple devices.";
  }
  return "Premium computer component built to the highest industry standards. Offers reliability, speed, and great performance for your system. Backed by local service support and official brand warranty.";
}
