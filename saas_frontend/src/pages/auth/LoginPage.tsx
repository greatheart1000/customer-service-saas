/**
 * 美观的登录/注册页面 - 支持多种登录方式
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Login as LoginIcon,
  QrCode2,
  QrCode as QRCodeIcon,
  CheckCircle,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const [tabValue, setTabValue] = useState(0);

  // 邮箱密码登录状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // 手机号登录状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');

  // 微信登录状态
  const [qrUrl, setQrUrl] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_wechatState, setWechatState] = useState('');
  const [wechatStatus, setWechatStatus] = useState<'pending' | 'scanning' | 'confirmed' | 'expired'>('pending');
  const [wechatLoading, setWechatLoading] = useState(false);

  const handleEmailLogin = async () => {
    setEmailError('');
    setEmailLoading(true);

    try {
      await authService.login({ username: email, password });

      // 根据用户角色跳转到不同页面
      const user = authService.getUserFromStorage();
      if (user?.is_admin || user?.is_org_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/chat');
      }
    } catch (err: any) {
      setEmailError(err.message || '登录失败');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendCode = async () => {
    setPhoneError('');
    setCodeSending(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/sms/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // 开发环境显示验证码
        if (data.debug_code) {
          alert(`验证码：${data.debug_code}`);
        }
      } else {
        setPhoneError(data.detail || '发送失败');
      }
    } catch (err) {
      setPhoneError('网络错误');
    } finally {
      setCodeSending(false);
    }
  };

  const handlePhoneLogin = async () => {
    setPhoneError('');
    setCodeLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/sms/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        navigate('/dashboard');
      } else {
        setPhoneError(data.detail || '登录失败');
      }
    } catch (err) {
      setPhoneError('网络错误');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleWeChatLogin = async () => {
    setWechatLoading(true);

    try {
      // 获取二维码
      const response = await fetch('http://localhost:8000/api/v1/auth/wechat/qr-code');
      const data = await response.json();

      setQrUrl(data.qr_url);
      setWechatState(data.state);

      // 轮询检查状态
      checkWeChatStatus(data.state);
    } catch (err) {
      console.error('微信登录失败:', err);
    } finally {
      setWechatLoading(false);
    }
  };

  const checkWeChatStatus = async (state: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/auth/wechat/check-status?state=${state}`);
        const data = await response.json();

        setWechatStatus(data.status);

        if (data.status === 'confirmed') {
          clearInterval(interval);
          // 登录成功，跳转
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            navigate('/dashboard');
          }
        } else if (data.status === 'expired') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('检查状态失败:', err);
      }
    }, 2000);

    // 5分钟后停止轮询
    setTimeout(() => clearInterval(interval), 300000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Logo 和标题 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                智能客服 SaaS 平台
              </Typography>
              <Typography variant="body2" color="textSecondary">
                选择您喜欢的登录方式
              </Typography>
            </Box>

            {/* 登录方式切换 */}
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{ mb: 3 }}
              centered
            >
              <Tab icon={<Email />} label="邮箱登录" />
              <Tab icon={<Phone />} label="手机登录" />
              <Tab icon={<QrCode2 />} label="微信登录" />
            </Tabs>

            {/* 邮箱密码登录 */}
            {tabValue === 0 && (
              <Slide direction="right" in={tabValue === 0} mountOnEnter unmountOnExit>
                <Box>
                  <TextField
                    fullWidth
                    label="邮箱地址"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="密码"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LoginIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {emailError && (
                    <Alert severity="error" sx={{ mb: 2 }} variant="filled">
                      {emailError}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleEmailLogin}
                    disabled={emailLoading || !email || !password}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.6)',
                      },
                    }}
                  >
                    {emailLoading ? <CircularProgress size={24} color="inherit" /> : '登录'}
                  </Button>

                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      还没有账户？{' '}
                      <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                        立即注册
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Slide>
            )}

            {/* 手机号登录 */}
            {tabValue === 1 && (
              <Slide direction="left" in={tabValue === 1} mountOnEnter unmountOnExit>
                <Box>
                  <TextField
                    fullWidth
                    label="手机号码"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入11位手机号"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="请输入验证码"
                    />

                    <Button
                      variant="outlined"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || codeSending || !phone}
                      sx={{ minWidth: 120 }}
                    >
                      {codeSending ? (
                        <CircularProgress size={20} />
                      ) : countdown > 0 ? (
                        `${countdown}s`
                      ) : (
                        '发送'
                      )}
                    </Button>
                  </Box>

                  {phoneError && (
                    <Alert severity="error" sx={{ mb: 2 }} variant="filled">
                      {phoneError}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handlePhoneLogin}
                    disabled={codeLoading || !phone || !code}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    {codeLoading ? <CircularProgress size={24} color="inherit" /> : '登录'}
                  </Button>
                </Box>
              </Slide>
            )}

            {/* 微信登录 */}
            {tabValue === 2 && (
              <Fade in={tabValue === 2} timeout={600}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  {wechatLoading ? (
                    <CircularProgress />
                  ) : qrUrl ? (
                    <>
                      <Box
                        sx={{
                          display: 'inline-block',
                          p: 2,
                          background: 'white',
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                      >
                        <QRCodeSVG value={qrUrl} size={200} />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Chip
                          icon={<CheckCircle />}
                          label={
                            wechatStatus === 'pending' ? '请使用微信扫描二维码' :
                            wechatStatus === 'scanning' ? '已扫描，请在手机上确认' :
                            wechatStatus === 'confirmed' ? '登录成功！' :
                            '二维码已过期'
                          }
                          color={
                            wechatStatus === 'pending' ? 'default' :
                            wechatStatus === 'scanning' ? 'info' :
                            wechatStatus === 'confirmed' ? 'success' :
                            'error'
                          }
                          sx={{ fontSize: '1rem', py: 2 }}
                        />
                      </Box>

                      <Button
                        variant="outlined"
                        onClick={handleWeChatLogin}
                        sx={{ mt: 2 }}
                      >
                        刷新二维码
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleWeChatLogin}
                      startIcon={<QRCodeIcon />}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(45deg, #09BB07 30%, #07C160 90%)',
                        boxShadow: '0 8px 16px rgba(9, 187, 7, 0.4)',
                      }}
                    >
                      生成微信登录二维码
                    </Button>
                  )}
                </Box>
              </Fade>
            )}

            {/* 底部提示 */}
            <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="textSecondary" align="center" display="block">
                登录即表示您同意我们的服务条款和隐私政策
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;
