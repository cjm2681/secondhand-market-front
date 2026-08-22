import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Paper, Button,
    TextField, Divider, Chip, Alert, Tab, Tabs
} from '@mui/material';
import {
    getMyPointHistory,
    getMyWithdrawals,
    requestWithdrawal
} from '../api/point';
import { getMe } from '../api/user';

export default function PointPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [user, setUser] = useState(null);
    const [pointHistory, setPointHistory] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [form, setForm] = useState({ amount: '', bankName: '', accountNumber: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, historyRes, withdrawalRes] = await Promise.all([
                getMe(),
                getMyPointHistory(),
                getMyWithdrawals()
            ]);
            setUser(userRes.data.data);
            setPointHistory(historyRes.data.data);
            setWithdrawals(withdrawalRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await requestWithdrawal({
                amount: Number(form.amount),
                bankName: form.bankName,
                accountNumber: form.accountNumber
            });
            setMsg({ type: 'success', text: '출금 신청이 완료되었습니다.' });
            setForm({ amount: '', bankName: '', accountNumber: '' });
            fetchData(); // 포인트 잔액 갱신
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || '출금 신청에 실패했습니다.' });
        }
    };

    const withdrawalStatusLabel = {
        PENDING:   { label: '대기중',  color: 'warning' },
        COMPLETED: { label: '완료',    color: 'success' },
        REJECTED:  { label: '거절됨',  color: 'error' },
    };

    const pointTypeLabel = {
        EARN:     '적립',
        WITHDRAW: '출금신청',
        REFUND:   '환불',
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('ko-KR');

    if (!user) return null;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>포인트</Typography>

            {/* 포인트 잔액 */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="body2" color="text.secondary">현재 포인트 잔액</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    {user.point?.toLocaleString()}원
                </Typography>
            </Paper>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="출금 신청" />
                <Tab label="포인트 내역" />
                <Tab label="출금 내역" />
            </Tabs>

            {/* 탭 0: 출금 신청 */}
            {tab === 0 && (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        출금 신청
                    </Typography>
                    {msg.text && (
                        <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>
                    )}
                    <form onSubmit={handleWithdrawal}
                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <TextField
                            label="출금 금액 (최소 1,000원)"
                            type="number"
                            size="small"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            required fullWidth />
                        <TextField
                            label="은행명"
                            size="small"
                            value={form.bankName}
                            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                            required fullWidth />
                        <TextField
                            label="계좌번호"
                            size="small"
                            value={form.accountNumber}
                            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                            required fullWidth />
                        <Button type="submit" variant="contained">출금 신청</Button>
                    </form>
                </Paper>
            )}

            {/* 탭 1: 포인트 내역 */}
            {tab === 1 && (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        포인트 내역
                    </Typography>
                    {pointHistory.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center">
                            포인트 내역이 없습니다.
                        </Typography>
                    ) : (
                        pointHistory.map((h) => (
                            <Box key={h.id}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" align="left">
                                            {h.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" align="left">
                                            {formatDate(h.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={h.amount > 0 ? 'success.main' : 'error.main'}>
                                            {h.amount > 0 ? '+' : ''}{h.amount.toLocaleString()}원
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            잔액 {h.balanceAfter.toLocaleString()}원
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />
                            </Box>
                        ))
                    )}
                </Paper>
            )}

            {/* 탭 2: 출금 내역 */}
            {tab === 2 && (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        출금 내역
                    </Typography>
                    {withdrawals.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center">
                            출금 내역이 없습니다.
                        </Typography>
                    ) : (
                        withdrawals.map((w) => (
                            <Box key={w.id}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" align="left">
                                            {w.bankName} {w.accountNumber}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" align="left">
                                            {formatDate(w.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {w.amount.toLocaleString()}원
                                        </Typography>
                                        <Chip
                                            label={withdrawalStatusLabel[w.status]?.label}
                                            color={withdrawalStatusLabel[w.status]?.color}
                                            size="small" />
                                    </Box>
                                </Box>
                                <Divider />
                            </Box>
                        ))
                    )}
                </Paper>
            )}
        </Container>
    );
}