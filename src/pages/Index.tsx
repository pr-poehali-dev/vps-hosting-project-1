import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type TabType = 'servers' | 'monitoring' | 'domains' | 'billing' | 'api' | 'security' | 'support';

interface Server {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'loading';
  cpu: number;
  ram: number;
  disk: number;
  ip: string;
  region: string;
}

interface ConsoleOutput {
  text: string;
  type: 'input' | 'output' | 'error';
}

interface Domain {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'expired';
  dnsRecords: number;
  sslStatus: 'valid' | 'expired' | 'none';
  expiryDate: string;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('servers');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [consoleHistory, setConsoleHistory] = useState<ConsoleOutput[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [servers, setServers] = useState<Server[]>([
    { id: '1', name: 'Web-Server-01', status: 'online', cpu: 45, ram: 62, disk: 38, ip: '192.168.1.10', region: 'Москва' },
    { id: '2', name: 'Database-01', status: 'online', cpu: 78, ram: 85, disk: 71, ip: '192.168.1.11', region: 'Санкт-Петербург' },
    { id: '3', name: 'API-Server-01', status: 'loading', cpu: 12, ram: 24, disk: 15, ip: '192.168.1.12', region: 'Казань' },
    { id: '4', name: 'Backup-Server', status: 'offline', cpu: 0, ram: 0, disk: 92, ip: '192.168.1.13', region: 'Новосибирск' },
  ]);
  const [domains] = useState<Domain[]>([
    { id: '1', name: 'example.com', status: 'active', dnsRecords: 8, sslStatus: 'valid', expiryDate: '2025-12-15' },
    { id: '2', name: 'api.example.com', status: 'active', dnsRecords: 4, sslStatus: 'valid', expiryDate: '2025-12-15' },
    { id: '3', name: 'test-site.ru', status: 'active', dnsRecords: 12, sslStatus: 'valid', expiryDate: '2026-03-20' },
    { id: '4', name: 'old-project.net', status: 'pending', dnsRecords: 3, sslStatus: 'none', expiryDate: '2025-01-10' },
    { id: '5', name: 'expired-domain.com', status: 'expired', dnsRecords: 0, sslStatus: 'expired', expiryDate: '2024-11-01' },
  ]);

  useEffect(() => {
    if (consoleOpen && selectedServer) {
      setConsoleHistory([
        { text: `Welcome to VPS Cloud Console`, type: 'output' },
        { text: `Server IP: ${selectedServer.ip}`, type: 'output' },
        { text: `Region: ${selectedServer.region}`, type: 'output' },
        { text: `Status: ${getStatusText(selectedServer.status)}`, type: 'output' },
        { text: '', type: 'output' },
        { text: 'System Resources:', type: 'output' },
        { text: `CPU Usage: ${selectedServer.cpu}%`, type: 'output' },
        { text: `RAM Usage: ${selectedServer.ram}%`, type: 'output' },
        { text: `Disk Usage: ${selectedServer.disk}%`, type: 'output' },
        { text: '', type: 'output' },
      ]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [consoleOpen, selectedServer]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setConsoleHistory(prev => [...prev, { text: `root@${selectedServer?.name}:~# ${trimmedCmd}`, type: 'input' }]);

    const lowerCmd = trimmedCmd.toLowerCase();

    if (lowerCmd === 'help') {
      setConsoleHistory(prev => [...prev,
        { text: 'Доступные команды:', type: 'output' },
        { text: '  status   - показать статус сервера', type: 'output' },
        { text: '  ps       - список процессов', type: 'output' },
        { text: '  uptime   - время работы сервера', type: 'output' },
        { text: '  free     - информация о памяти', type: 'output' },
        { text: '  df       - использование диска', type: 'output' },
        { text: '  .op      - показать ASCII-арт', type: 'output' },
        { text: '  clear    - очистить консоль', type: 'output' },
        { text: '  help     - показать эту справку', type: 'output' },
        { text: '', type: 'output' },
      ]);
    } else if (lowerCmd === 'status') {
      const currentServer = servers.find(s => s.id === selectedServer?.id);
      setConsoleHistory(prev => [...prev,
        { text: `Server: ${currentServer?.name}`, type: 'output' },
        { text: `Status: ${getStatusText(currentServer?.status || 'offline')}`, type: 'output' },
        { text: `IP: ${currentServer?.ip}`, type: 'output' },
        { text: `Region: ${currentServer?.region}`, type: 'output' },
        { text: '', type: 'output' },
      ]);
      setSelectedServer(currentServer || null);
    } else if (lowerCmd === 'ps') {
      setConsoleHistory(prev => [...prev,
        { text: 'PID  USER     TIME  COMMAND', type: 'output' },
        { text: '1    root     0:01  /sbin/init', type: 'output' },
        { text: '102  root     0:03  nginx: master process', type: 'output' },
        { text: '203  www-data 0:12  nginx: worker process', type: 'output' },
        { text: '305  postgres 1:24  postgres: main process', type: 'output' },
        { text: '', type: 'output' },
      ]);
    } else if (lowerCmd === 'uptime') {
      setConsoleHistory(prev => [...prev,
        { text: '15:42:31 up 12 days, 4:23, 1 user, load average: 0.42, 0.38, 0.35', type: 'output' },
        { text: '', type: 'output' },
      ]);
    } else if (lowerCmd === 'free') {
      setConsoleHistory(prev => [...prev,
        { text: '              total        used        free      shared', type: 'output' },
        { text: `Mem:          8192        ${selectedServer?.ram ? Math.round(8192 * selectedServer.ram / 100) : 0}        ${selectedServer?.ram ? 8192 - Math.round(8192 * selectedServer.ram / 100) : 8192}        128`, type: 'output' },
        { text: 'Swap:         2048         0        2048', type: 'output' },
        { text: '', type: 'output' },
      ]);
    } else if (lowerCmd === 'df') {
      setConsoleHistory(prev => [...prev,
        { text: 'Filesystem     Size  Used Avail Use% Mounted on', type: 'output' },
        { text: `/dev/sda1      100G   ${selectedServer?.disk}G   ${100 - (selectedServer?.disk || 0)}G  ${selectedServer?.disk}% /`, type: 'output' },
        { text: '', type: 'output' },
      ]);
    } else if (lowerCmd === '.op') {
      setConsoleHistory(prev => [...prev,
        { text: '', type: 'output' },
        { text: '    ██████╗ ███████╗██╗  ██╗ █████╗ ██╗     ██╗', type: 'output' },
        { text: '    ██╔══██╗██╔════╝██║  ██║██╔══██╗██║     ██║', type: 'output' },
        { text: '    ██████╔╝█████╗  ███████║███████║██║     ██║', type: 'output' },
        { text: '    ██╔═══╝ ██╔══╝  ██╔══██║██╔══██║██║     ██║', type: 'output' },
        { text: '    ██║     ███████╗██║  ██║██║  ██║███████╗██║', type: 'output' },
        { text: '    ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝', type: 'output' },
        { text: '', type: 'output' },
        { text: '           🚀 VPS Cloud - Поехали! 🚀', type: 'output' },
        { text: '', type: 'output' },
        { text: '    Три... два... один... ПОЕХАЛИ!', type: 'output' },
        { text: '    Управляй серверами как настоящий космонавт!', type: 'output' },
        { text: '', type: 'output' },
      ]);
    } else if (lowerCmd === 'clear') {
      setConsoleHistory([]);
    } else {
      setConsoleHistory(prev => [...prev,
        { text: `bash: ${trimmedCmd}: command not found`, type: 'error' },
        { text: 'Введите "help" для списка доступных команд', type: 'output' },
        { text: '', type: 'output' },
      ]);
    }

    setCurrentCommand('');
  };
  
  const handleRebootServer = (serverId: string) => {
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === serverId 
          ? { ...server, status: 'loading' as const }
          : server
      )
    );

    setTimeout(() => {
      setServers(prevServers => 
        prevServers.map(server => 
          server.id === serverId 
            ? { ...server, status: 'online' as const }
            : server
        )
      );
    }, 3000);
  };

  const menuItems = [
    { id: 'servers' as TabType, icon: 'Server', label: 'Серверы', count: 4 },
    { id: 'monitoring' as TabType, icon: 'Activity', label: 'Мониторинг' },
    { id: 'domains' as TabType, icon: 'Globe', label: 'Домены', count: 12 },
    { id: 'billing' as TabType, icon: 'CreditCard', label: 'Биллинг' },
    { id: 'api' as TabType, icon: 'Code', label: 'API' },
    { id: 'security' as TabType, icon: 'Shield', label: 'Безопасность' },
    { id: 'support' as TabType, icon: 'MessageCircle', label: 'Поддержка', badge: '2' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'online': return 'Работает';
      case 'offline': return 'Выключен';
      case 'loading': return 'Загрузка';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">VPS Cloud</h1>
            <p className="text-xs text-muted-foreground mt-1">Панель управления</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'gradient-purple text-white shadow-lg'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count && (
                  <Badge variant="secondary" className="bg-white/10">
                    {item.count}
                  </Badge>
                )}
                {item.badge && (
                  <Badge variant="destructive" className="animate-pulse-glow">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 glass rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center">
                <Icon name="User" size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@vps.cloud</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {activeTab === 'servers' && 'Управление серверами'}
              {activeTab === 'monitoring' && 'Мониторинг ресурсов'}
              {activeTab === 'domains' && 'Домены'}
              {activeTab === 'billing' && 'Биллинг'}
              {activeTab === 'api' && 'API & Автоматизация'}
              {activeTab === 'security' && 'Безопасность'}
              {activeTab === 'support' && 'Поддержка'}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'servers' && 'Создавайте, управляйте и мониторьте ваши VPS'}
              {activeTab === 'monitoring' && 'Отслеживайте производительность в реальном времени'}
              {activeTab === 'domains' && 'Управление DNS и доменными именами'}
              {activeTab === 'billing' && 'Тарифы, платежи и история операций'}
              {activeTab === 'api' && 'Интеграция и управление через API'}
              {activeTab === 'security' && 'SSH ключи, файрволы и резервные копии'}
              {activeTab === 'support' && 'Техническая поддержка 24/7'}
            </p>
          </div>

          {activeTab === 'servers' && (
            <>
              <div className="mb-6 flex gap-4">
                <Button className="gradient-purple shadow-lg hover:shadow-xl transition-shadow">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать сервер
                </Button>
                <Button variant="outline">
                  <Icon name="RefreshCw" size={20} className="mr-2" />
                  Обновить
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {servers.map((server) => (
                  <Card key={server.id} className="p-6 glass animate-fade-in hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{server.name}</h3>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)} ${server.status === 'loading' ? 'animate-pulse-glow' : ''}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">{server.ip} • {server.region}</p>
                      </div>
                      <Badge variant={server.status === 'online' ? 'default' : server.status === 'loading' ? 'secondary' : 'destructive'}>
                        {getStatusText(server.status)}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">CPU</span>
                          <span className="font-semibold">{server.cpu}%</span>
                        </div>
                        <Progress value={server.cpu} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">RAM</span>
                          <span className="font-semibold">{server.ram}%</span>
                        </div>
                        <Progress value={server.ram} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Диск</span>
                          <span className="font-semibold">{server.disk}%</span>
                        </div>
                        <Progress value={server.disk} className="h-2" />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedServer(server);
                          setConsoleOpen(true);
                        }}
                      >
                        <Icon name="Terminal" size={16} className="mr-2" />
                        Консоль
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleRebootServer(server.id)}
                        disabled={server.status === 'loading'}
                      >
                        <Icon name="RotateCw" size={16} className="mr-2" />
                        {server.status === 'loading' ? 'Перезагрузка...' : 'Перезагрузить'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeTab === 'monitoring' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">Нагрузка CPU</h3>
                  <div className="w-12 h-12 gradient-purple rounded-lg flex items-center justify-center">
                    <Icon name="Cpu" size={24} />
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">42%</p>
                <p className="text-sm text-green-500">↓ 8% за последний час</p>
              </Card>

              <Card className="p-6 glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">Память</h3>
                  <div className="w-12 h-12 gradient-blue rounded-lg flex items-center justify-center">
                    <Icon name="Database" size={24} />
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">67%</p>
                <p className="text-sm text-yellow-500">↑ 3% за последний час</p>
              </Card>

              <Card className="p-6 glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">Сеть</h3>
                  <div className="w-12 h-12 gradient-purple rounded-lg flex items-center justify-center">
                    <Icon name="Network" size={24} />
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">1.2 GB/s</p>
                <p className="text-sm text-green-500">Стабильно</p>
              </Card>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <Card className="p-6 glass animate-fade-in">
                <h3 className="text-xl font-bold mb-4">Ваш API ключ</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value="vps_sk_live_a8f4k2j9d3h7s6m1p0q5w8e2r7t9y4u6"
                    readOnly
                    className="flex-1 px-4 py-2 bg-input border border-border rounded-lg font-mono text-sm"
                  />
                  <Button variant="outline">
                    <Icon name="Copy" size={20} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Используйте этот ключ для автоматизации управления серверами
                </p>
              </Card>

              <Card className="p-6 glass animate-fade-in">
                <h3 className="text-xl font-bold mb-4">Примеры запросов</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-input rounded-lg">
                    <p className="text-sm font-semibold mb-2">Список серверов</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      GET https://api.vps.cloud/v1/servers
                    </code>
                  </div>
                  <div className="p-4 bg-input rounded-lg">
                    <p className="text-sm font-semibold mb-2">Создать сервер</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      POST https://api.vps.cloud/v1/servers/create
                    </code>
                  </div>
                  <div className="p-4 bg-input rounded-lg">
                    <p className="text-sm font-semibold mb-2">Перезагрузить сервер</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      POST https://api.vps.cloud/v1/servers/:id/reboot
                    </code>
                  </div>
                </div>
                <Button className="mt-4 gradient-blue">
                  <Icon name="Book" size={20} className="mr-2" />
                  Документация API
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="p-6 gradient-purple text-white animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Текущий баланс</p>
                    <p className="text-5xl font-bold">₽12,450</p>
                  </div>
                  <Button variant="secondary" size="lg">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Пополнить
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass animate-fade-in">
                  <h4 className="font-semibold mb-2">Этот месяц</h4>
                  <p className="text-3xl font-bold">₽2,890</p>
                  <p className="text-sm text-muted-foreground mt-1">4 активных сервера</p>
                </Card>
                <Card className="p-6 glass animate-fade-in">
                  <h4 className="font-semibold mb-2">Прошлый месяц</h4>
                  <p className="text-3xl font-bold">₽3,120</p>
                  <p className="text-sm text-muted-foreground mt-1">5 активных серверов</p>
                </Card>
                <Card className="p-6 glass animate-fade-in">
                  <h4 className="font-semibold mb-2">Средний расход</h4>
                  <p className="text-3xl font-bold">₽2,950</p>
                  <p className="text-sm text-muted-foreground mt-1">За последние 6 мес.</p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'domains' && (
            <>
              <div className="mb-6 flex gap-4">
                <Button className="gradient-purple shadow-lg hover:shadow-xl transition-shadow">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить домен
                </Button>
                <Button variant="outline">
                  <Icon name="RefreshCw" size={20} className="mr-2" />
                  Обновить DNS
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {domains.map((domain) => (
                  <Card key={domain.id} className="p-6 glass animate-fade-in hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 gradient-blue rounded-lg flex items-center justify-center">
                          <Icon name="Globe" size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold">{domain.name}</h3>
                            <Badge variant={domain.status === 'active' ? 'default' : domain.status === 'pending' ? 'secondary' : 'destructive'}>
                              {domain.status === 'active' ? 'Активен' : domain.status === 'pending' ? 'Ожидание' : 'Истёк'}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>DNS записей: {domain.dnsRecords}</span>
                            <span>•</span>
                            <span className={domain.sslStatus === 'valid' ? 'text-green-500' : 'text-red-500'}>
                              SSL: {domain.sslStatus === 'valid' ? 'Валиден' : domain.sslStatus === 'expired' ? 'Истёк' : 'Отсутствует'}
                            </span>
                            <span>•</span>
                            <span>Истекает: {domain.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Icon name="Settings" size={16} className="mr-2" />
                          DNS
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon name="Shield" size={16} className="mr-2" />
                          SSL
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {(activeTab === 'security' || activeTab === 'support') && (
            <Card className="p-12 glass text-center animate-fade-in">
              <div className="w-20 h-20 gradient-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name={activeTab === 'security' ? 'Shield' : 'MessageCircle'} size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Раздел в разработке</h3>
              <p className="text-muted-foreground">
                Этот функционал скоро будет доступен
              </p>
            </Card>
          )}
        </main>
      </div>

      <Dialog open={consoleOpen} onOpenChange={setConsoleOpen}>
        <DialogContent className="max-w-4xl h-[600px] bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Icon name="Terminal" size={24} />
              <span>Консоль сервера: {selectedServer?.name}</span>
              <Badge 
                variant={
                  servers.find(s => s.id === selectedServer?.id)?.status === 'online' 
                    ? 'default' 
                    : servers.find(s => s.id === selectedServer?.id)?.status === 'loading'
                    ? 'secondary'
                    : 'destructive'
                } 
                className="ml-2"
              >
                {getStatusText(servers.find(s => s.id === selectedServer?.id)?.status || 'offline')}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-black rounded-lg p-4 font-mono text-sm overflow-auto" onClick={() => inputRef.current?.focus()}>
            <div className="text-green-400">
              {consoleHistory.map((line, idx) => (
                <p 
                  key={idx} 
                  className={`${
                    line.type === 'input' ? 'text-green-400' : 
                    line.type === 'error' ? 'text-red-400' : 
                    'text-gray-300'
                  }`}
                >
                  {line.text}
                </p>
              ))}
              <div className="flex items-center">
                <span className="text-yellow-400">root@{selectedServer?.name}:~#</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommand(currentCommand);
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-green-400 ml-2"
                  autoFocus
                />
              </div>
              <div ref={consoleEndRef} />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Скачать логи
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Copy" size={16} className="mr-2" />
              Копировать вывод
            </Button>
            <div className="flex-1" />
            <Button variant="default" size="sm" onClick={() => setConsoleOpen(false)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}