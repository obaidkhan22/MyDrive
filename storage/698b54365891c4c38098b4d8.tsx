// Dashboard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  Home,
  Users,
  FolderKanban,
  BarChart3,
  Settings,
  Bell,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Calendar,
  Activity,
} from "lucide-react";
import Navbar from "../../layout/Navbar";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", color: "text-blue-500" },
    {
      id: "tasks",
      icon: FolderKanban,
      label: "Task Manager",
      color: "text-purple-500",
    },
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics",
      color: "text-blue-400",
    },
    {
      id: "team",
      icon: Users,
      label: "Team Members",
      color: "text-purple-400",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      color: "text-blue-300",
    },
  ];

  const statsCards = [
    {
      title: "Total Tasks",
      value: "1,234",
      change: "+12%",
      icon: FolderKanban,
      color: "from-blue-500 to-purple-500",
      trend: "up",
    },
    {
      title: "Completed",
      value: "876",
      change: "+8%",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
      trend: "up",
    },
    {
      title: "Pending",
      value: "215",
      change: "-3%",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      trend: "down",
    },
    {
      title: "Overdue",
      value: "143",
      change: "+5%",
      icon: AlertCircle,
      color: "from-red-500 to-pink-500",
      trend: "up",
    },
  ];

  const recentTasks = [
    {
      id: 1,
      title: "Design Dashboard UI",
      project: "Admin Panel",
      priority: "High",
      dueDate: "Today",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Fix Authentication Bug",
      project: "Backend",
      priority: "Medium",
      dueDate: "Tomorrow",
      status: "Pending",
    },
    {
      id: 3,
      title: "User Testing",
      project: "Mobile App",
      priority: "Low",
      dueDate: "Dec 25",
      status: "Completed",
    },
    {
      id: 4,
      title: "Database Optimization",
      project: "Infrastructure",
      priority: "High",
      dueDate: "Today",
      status: "In Progress",
    },
    {
      id: 5,
      title: "Write Documentation",
      project: "Documentation",
      priority: "Medium",
      dueDate: "Dec 28",
      status: "Pending",
    },
  ];

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Project Manager",
      tasks: 42,
      avatarColor: "bg-blue-500",
    },
    {
      name: "Sarah Miller",
      role: "Frontend Dev",
      tasks: 38,
      avatarColor: "bg-purple-500",
    },
    {
      name: "Mike Chen",
      role: "Backend Dev",
      tasks: 35,
      avatarColor: "bg-blue-400",
    },
    {
      name: "Emma Davis",
      role: "UI/UX Designer",
      tasks: 28,
      avatarColor: "bg-purple-400",
    },
  ];

  const projectProgress = [
    {
      name: "Admin Dashboard",
      progress: 85,
      color: "bg-gradient-to-r from-blue-500 to-purple-500",
    },
    {
      name: "Mobile App",
      progress: 60,
      color: "bg-gradient-to-r from-purple-500 to-blue-400",
    },
    {
      name: "API Development",
      progress: 45,
      color: "bg-gradient-to-r from-blue-400 to-purple-400",
    },
    {
      name: "Documentation",
      progress: 30,
      color: "bg-gradient-to-r from-purple-400 to-blue-300",
    },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <Navbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700 min-h-[calc(100vh-4rem)]"
            >
              <nav className="p-4">
                <motion.ul
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {menuItems.map((item) => (
                    <motion.li key={item.id} variants={itemVariants}>
                      <motion.button
                        whileHover={{ x: 5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveMenu(item.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          activeMenu === item.id
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-500"
                            : "hover:bg-gray-700/50"
                        }`}
                      >
                        <item.icon className={`${item.color}`} size={20} />
                        <span className="font-medium">{item.label}</span>
                        {activeMenu === item.id && (
                          <motion.div
                            layoutId="activeMenu"
                            className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          />
                        )}
                      </motion.button>
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-gray-700"
                >
                  <h3 className="font-bold mb-2">Daily Target</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed Tasks</span>
                      <span className="text-blue-400">24/30</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold mt-1"
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                    >
                      <stat.icon size={24} />
                    </motion.div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp
                      size={16}
                      className={
                        stat.trend === "up" ? "text-green-400" : "text-red-400"
                      }
                    />
                    <span
                      className={
                        stat.trend === "up" ? "text-green-400" : "text-red-400"
                      }
                    >
                      {stat.change} from last month
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Tasks */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Recent Tasks</h2>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {recentTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ rotate: 180 }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            task.priority === "High"
                              ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30"
                              : task.priority === "Medium"
                              ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30"
                              : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                          }`}
                        >
                          <Calendar size={18} />
                        </motion.div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-400">
                            {task.project}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            task.priority === "High"
                              ? "bg-red-500/20 text-red-400"
                              : task.priority === "Medium"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-gray-400">{task.dueDate}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            task.status === "Completed"
                              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400"
                              : task.status === "In Progress"
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {task.status}
                        </span>
                        <MoreVertical className="text-gray-400 group-hover:text-white transition-colors cursor-pointer" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Team & Progress */}
              <div className="space-y-6">
                {/* Team Members */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700"
                >
                  <h2 className="text-xl font-bold mb-6">Team Members</h2>
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full ${member.avatarColor}`}
                          ></div>
                          <div>
                            <h3 className="font-medium">{member.name}</h3>
                            <p className="text-sm text-gray-400">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{member.tasks}</p>
                          <p className="text-sm text-gray-400">tasks</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Project Progress */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700"
                >
                  <h2 className="text-xl font-bold mb-6">Project Progress</h2>
                  <div className="space-y-4">
                    {projectProgress.map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span>{project.name}</span>
                          <span className="text-blue-400">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{
                              delay: index * 0.1 + 0.7,
                              duration: 1,
                            }}
                            className={`h-full rounded-full ${project.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
