import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductCreatePage from './pages/ProductCreatePage';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';
import BoardCreatePage from './pages/BoardCreatePage';
import ChatPage from './pages/ChatPage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyProfilePage from './pages/MyProfilePage';
import PasswordResetPage from './pages/PasswordResetPage';

import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';

import AdminPage from './pages/AdminPage';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* 비로그인 접근 가능 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/boards" element={<BoardListPage />} />
        <Route path="/boards/:id" element={<BoardDetailPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />

        {/* 로그인 필요 */}
        <Route element={<PrivateRoute />}>
          <Route path="/products/create" element={<ProductCreatePage />} />
          <Route path="/products/:id/edit" element={<ProductCreatePage />} />
          <Route path="/boards/create" element={<BoardCreatePage />} />
          <Route path="/boards/:id/edit" element={<BoardCreatePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;