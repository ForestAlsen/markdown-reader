import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const { isDark, toggleDark, fontSize, setFontSize, colors } = useTheme();
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password, email || undefined);
      }
      Alert.alert('成功', mode === 'login' ? '登录成功' : '注册成功');
    } catch (e) {
      Alert.alert('错误', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Reading section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          阅读设置
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>夜间模式</Text>
          <Switch
            value={isDark}
            onValueChange={toggleDark}
            trackColor={{ false: '#d6d3d1', true: colors.accent }}
            thumbColor={isDark ? '#fff' : '#fff'}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>字号</Text>
          <View style={styles.sizeOptions}>
            {(['small', 'medium', 'large'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFontSize(s)}
                activeOpacity={0.65}
                style={[
                  styles.sizeBtn,
                  {
                    backgroundColor:
                      fontSize === s ? colors.accent : colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sizeBtnText,
                    { color: fontSize === s ? '#fff' : colors.subtext },
                  ]}
                >
                  {s === 'small' ? '小' : s === 'medium' ? '中' : '大'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Auth section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>账户</Text>
        {user ? (
          <View>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user.username}
                </Text>
                <Text style={[styles.userStatus, { color: colors.subtext }]}>
                  已登录
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.authBtn, { backgroundColor: colors.accent }]}
              onPress={logout}
              activeOpacity={0.65}
            >
              <Text style={styles.authBtnText}>退出登录</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View
              style={[
                styles.tabRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => setMode('login')}
                activeOpacity={0.65}
                style={[
                  styles.tab,
                  { borderBottomColor: mode === 'login' ? colors.accent : 'transparent' },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: mode === 'login' ? colors.accent : colors.subtext },
                  ]}
                >
                  登录
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMode('register')}
                activeOpacity={0.65}
                style={[
                  styles.tab,
                  {
                    borderBottomColor: mode === 'register' ? colors.accent : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: mode === 'register' ? colors.accent : colors.subtext,
                    },
                  ]}
                >
                  注册
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="用户名"
              placeholderTextColor={colors.subtext}
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="密码"
              placeholderTextColor={colors.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {mode === 'register' ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="邮箱（选填）"
                placeholderTextColor={colors.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : null}
            <TouchableOpacity
              style={[styles.authBtn, { backgroundColor: colors.accent }]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.65}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authBtnText}>
                  {mode === 'login' ? '登录' : '注册'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, letterSpacing: -0.3 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: { fontSize: 16, fontWeight: '500' },
  sizeOptions: { flexDirection: 'row', gap: 10 },
  sizeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  sizeBtnText: { fontSize: 14, fontWeight: '600' },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    paddingVertical: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: { fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  authBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
