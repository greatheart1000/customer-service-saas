# 设计系统规范

基于参考产品的设计规范

## 配色方案

### 主色调
```css
--primary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--primary-color: #f093fb;
--primary-dark: #f5576c;
```

### 中性色
```css
--bg-primary: #f5f7fa;        /* 主背景色 */
--bg-secondary: #ffffff;      /* 卡片背景 */
--text-primary: #1a1a2e;      /* 主文字 */
--text-secondary: #6b7280;    /* 次要文字 */
--text-disabled: #9ca3af;     /* 禁用文字 */
--border-color: #e5e7eb;      /* 边框色 */
```

### 功能色
```css
--success: #10b981;           /* 成功 */
--warning: #f59e0b;           /* 警告 */
--error: #ef4444;             /* 错误 */
--info: #3b82f6;              /* 信息 */
```

## 组件规范

### 卡片 (Card)
```css
background: #ffffff;
border-radius: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
padding: 24px;
transition: all 0.3s ease;

/* 悬停效果 */
&:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}
```

### 按钮 (Button)

#### 主要按钮
```css
background: var(--primary-gradient);
color: #ffffff;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
```

#### 次要按钮
```css
background: transparent;
color: var(--primary-color);
border: 1px solid var(--primary-color);
border-radius: 12px;
padding: 12px 24px;
```

#### 图标按钮
```css
width: 48px;
height: 48px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
```

### 表格 (Table)
```css
background: #ffffff;
border-radius: 12px;
overflow: hidden;

/* 表头 */
thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

/* 表格行 */
tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }
}

/* 斑马纹 */
tbody tr:nth-child(even) {
  background: #f9fafb;
}
```

### 标签 (Chip)
```css
border-radius: 20px;
padding: 6px 12px;
font-size: 13px;
font-weight: 500;

/* 状态颜色 */
&.success { background: #d1fae5; color: #065f46; }
&.warning { background: #fef3c7; color: #92400e; }
&.error { background: #fee2e2; color: #991b1b; }
&.info { background: #dbeafe; color: #1e40af; }
```

### 输入框 (TextField)
```css
border-radius: 12px;
border: 1px solid #e5e7eb;
background: #f9fafb;

&:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
}
```

## 布局规范

### 侧边栏
```css
width: 260px;
background: #1a1a2e;
color: #ffffff;
padding: 24px 0;

/* 导航项 */
.nav-item {
  padding: 14px 24px;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.2s;

  &.active {
    background: var(--primary-gradient);
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }
}
```

### 主内容区
```css
background: var(--bg-primary);
padding: 32px;
min-height: 100vh;
```

### 页面标题
```css
font-size: 28px;
font-weight: 700;
color: var(--text-primary);
margin-bottom: 8px;
```

### 页面副标题
```css
font-size: 14px;
color: var(--text-secondary);
margin-bottom: 32px;
```

## 间距规范

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

## 动画规范

```css
/* 过渡时间 */
--transition-fast: 150ms;
--transition-base: 300ms;
--transition-slow: 500ms;

/* 缓动函数 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 字体规范

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 字号 */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;

/* 字重 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 圆角规范

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;
```

## Material-UI 配置

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#f093fb',
      dark: '#f5576c',
    },
    secondary: {
      main: '#3b82f6',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          fontWeight: 600,
        },
      },
    },
  },
});
```

## 图标使用

### 尺寸
```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

### 圆形图标容器
```css
width: 48px;
height: 48px;
border-radius: 50%;
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
display: flex;
align-items: center;
justify-content: center;
color: white;
```

## 响应式断点

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

## 暗色模式（可选）

```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}
```
