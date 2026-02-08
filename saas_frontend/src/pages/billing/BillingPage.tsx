/**
 * 账单管理页面
 */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';

interface Plan {
  plan_type: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

const BillingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/subscriptions/plans');
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleUpgrade = (planType: string) => {
    setSelectedPlan(planType);
    setUpgradeDialogOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    try {
      // 这里应该调用支付 API
      // 模拟生成二维码
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        账单管理
      </Typography>

      {/* 当前订阅 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          当前订阅：免费版
        </Typography>
        <Typography color="textSecondary">
          您正在使用免费版，功能受限。升级到专业版或企业版以解锁更多功能。
        </Typography>
      </Paper>

      {/* 订阅计划 */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        选择适合您的计划
      </Typography>

      <Grid container spacing={3}>
        {plans
          .filter((plan) => plan.plan_type !== 'free')
          .map((plan) => (
            <Grid item xs={12} md={6} key={plan.plan_type}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: selectedPlan === plan.plan_type ? '2px solid #1976d2' : '1px solid #e0e0e0',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography component="h2" variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary">
                      ¥{billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly}
                    </Typography>
                    <Typography color="textSecondary">
                      / {billingCycle === 'yearly' ? '年' : '月'}
                    </Typography>
                    {billingCycle === 'yearly' && (
                      <Typography variant="body2" color="success.main">
                        年付省 ¥{plan.price_monthly * 12 - plan.price_yearly}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    功能特性
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {plan.features.map((feature, index) => (
                      <Typography component="li" key={index} variant="body2">
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleUpgrade(plan.plan_type)}
                  >
                    立即订阅
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* 升级对话框 */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>确认订阅</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">计费周期</FormLabel>
            <RadioGroup
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <FormControlLabel value="monthly" control={<Radio />} label="按月付费" />
              <FormControlLabel value="yearly" control={<Radio />} label="按年付费（省 20%）" />
            </RadioGroup>
          </FormControl>

          {qrCode && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography gutterBottom>扫描二维码支付</Typography>
              <img src={qrCode} alt="支付二维码" style={{ maxWidth: '200px' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>取消</Button>
          {!qrCode && (
            <Button variant="contained" onClick={handleConfirmUpgrade}>
              确认
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillingPage;
