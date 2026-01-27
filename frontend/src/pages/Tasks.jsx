import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { TbLayoutGrid, TbCircleDotted, TbCircleCheck, TbCalendarTime, TbList, TbLayoutList, TbLayersLinked } from "react-icons/tb";
import api from "../api/client";
import NewTask from "../components/NewTask";
import TaskCard from "../components/TaskCard";
import TaskOpen from "../components/TaskOpen";
import "./Tasks.css";

export default function Tasks() {
  const { token, searchQuery, sortBy, showNotification } = useOutletContext();
  
  const [tasks, setTasks] = useState([]);
  const [filterCompleted, setFilterCompleted] = useState(null);
  const [openTask, setOpenTask] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'list'
  const [isGrouped, setIsGrouped] = useState(true); // Priority Grouping
  const [dateGroupBy, setDateGroupBy] = useState("none"); // 'none' | 'day' | 'week' | 'month' | 'year'
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const [showNewTask, setShowNewTask] = useState(false);

  useEffect(() => {
    // Keyboard shortcut Alt + T
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowNewTask(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks`, {
        params: {
          token,
          search: searchQuery || undefined,
          completed:
            filterCompleted === null || filterCompleted === "due"
              ? undefined
              : filterCompleted,
          sort: sortBy,
        },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, sortBy, filterCompleted, token]);

  const createTask = async (payload) => {
    try {
      await api.post(`/tasks?token=${token}`, payload);
      if (showNotification) showNotification("Task created");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await api.patch(
        `/tasks/${task.id}/complete`,
        null,
        { params: { token, completed: !task.completed } }
      );
      if (showNotification) showNotification(task.completed ? "Marked incomplete" : "Marked complete");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const removeTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`, { params: { token } });
      if (showNotification) showNotification("Task deleted");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (id, payload) => {
    try {
      await api.put(`/tasks/${id}`, payload, { params: { token } });
      if (showNotification) showNotification("Task updated");
      setOpenTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const counts = useMemo(() => {
    const all = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => !t.completed).length;
    const due = tasks.filter(
      t => !t.completed && t.due_date && new Date(t.due_date) < new Date()
    ).length;
    return { all, completed, inProgress, due };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterCompleted === null) return true;
      if (filterCompleted === true) return t.completed;
      if (filterCompleted === false) return !t.completed;
      if (filterCompleted === "due")
        return !t.completed && t.due_date && new Date(t.due_date) < new Date();
      return true;
    });
  }, [tasks, filterCompleted]);

  // Sort by date helper
  const sortByDate = (a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  };

  // --- DATE HELPERS ---
  const getDateLabel = (dateStr) => {
     if (!dateStr) return "No Date";
     const date = new Date(dateStr);
     date.setHours(0,0,0,0);
     const now = new Date();
     now.setHours(0,0,0,0);
     
     if (dateGroupBy === "day") {
        if (date.getTime() < now.getTime()) return "Overdue";
        if (date.getTime() === now.getTime()) return "Today";
        const tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
        if (date.getTime() === tmrw.getTime()) return "Tomorrow";
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
     }
     if (dateGroupBy === "week") {
        if (date < now && date.toDateString() !== now.toDateString()) return "Overdue";
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
        return `Week ${week}, ${date.getFullYear()}`;
     }
     if (dateGroupBy === "month") {
        if (date < now && (date.getMonth() < now.getMonth() || date.getFullYear() < now.getFullYear())) return "Overdue";
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
     }
     if (dateGroupBy === "year") {
        if (date.getFullYear() < now.getFullYear()) return "Overdue";
        return date.getFullYear().toString();
     }
     return "All"; 
  };

  // Group a list of tasks by Date Category
  const groupListByDate = (list) => {
    const groups = {};
    list.forEach(t => {
      const label = getDateLabel(t.due_date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });
    
    // Sort keys (Overdue first, then Today, etc.)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
       const p = { "Overdue": 1, "Today": 2, "Tomorrow": 3 };
       if (p[a] && p[b]) return p[a] - p[b];
       if (p[a]) return -1;
       if (p[b]) return 1;
       if (a === "No Date") return 1; if (b === "No Date") return -1;
       return a.localeCompare(b);
    });

    return sortedKeys.map(k => ({ title: k, tasks: groups[k].sort(sortByDate) }));
  };

  // Computed Structure
  // If isGrouped (Priority): { "High": CONTENT, ... } where CONTENT is either [Tasks] or [{title: 'Today', tasks: []}...]
  // If !isGrouped: CONTENT
  const computedData = useMemo(() => {
    if (isGrouped) {
      // Priority Categories
      const groups = {
        "High Priority": [],
        "Medium Priority": [],
        "Low Priority": [],
        "No Priority": []
      };
      filteredTasks.forEach(t => {
        if (t.priority === 3) groups["High Priority"].push(t);
        else if (t.priority === 2) groups["Medium Priority"].push(t);
        else if (t.priority === 1) groups["Low Priority"].push(t);
        else groups["No Priority"].push(t);
      });

      // Process inside groups
      return Object.entries(groups).map(([name, list]) => {
        const sorted = list.sort(sortByDate);
        if (dateGroupBy !== "none" && list.length > 0) {
          return { type: "priority", title: name, content: groupListByDate(sorted), isNested: true };
        }
        return { type: "priority", title: name, content: sorted, isNested: false };
      }).filter(g => g.content.length > 0 || (Array.isArray(g.content) && g.content.length > 0)); 
    } else {
      // Flat List
      const sorted = [...filteredTasks].sort(sortByDate);
      if (dateGroupBy !== "none") {
        return { type: "flat", content: groupListByDate(sorted), isNested: true };
      }
      return { type: "flat", content: sorted, isNested: false };
    }
  }, [filteredTasks, isGrouped, dateGroupBy]);

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const renderTaskGrid = (taskList) => (
      <ul className={viewMode === "list" ? "tasks-list" : "tasks-grid"}>
        {taskList.map(t => (
          <li key={t.id}>
            <TaskCard
              task={t}
              onToggle={() => toggleComplete(t)}
              onDelete={() => removeTask(t.id)}
              onOpen={() => setOpenTask(t)}
            />
          </li>
        ))}
      </ul>
  );

  return (
    <div className="tasks-container">
      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-chips">
          <button
            className={`filter-chip${filterCompleted === null ? " active" : ""}`}
            onClick={() => setFilterCompleted(null)}
            aria-label="Show all tasks"
          >
            <TbLayoutGrid className="chip-icon" />
            <span>All</span>
            <span className="chip-count">{counts.all}</span>
          </button>
          <button
            className={`filter-chip${filterCompleted === false ? " active" : ""}`}
            onClick={() => setFilterCompleted(false)}
            aria-label="Show in-progress tasks"
          >
            <TbCircleDotted className="chip-icon" />
            <span>In Progress</span>
            <span className="chip-count">{counts.inProgress}</span>
          </button>
          <button
            className={`filter-chip${filterCompleted === true ? " active" : ""}`}
            onClick={() => setFilterCompleted(true)}
            aria-label="Show completed tasks"
          >
            <TbCircleCheck className="chip-icon" />
            <span>Completed</span>
            <span className="chip-count">{counts.completed}</span>
          </button>
          <button
            className={`filter-chip${filterCompleted === "due" ? " active" : ""}`}
            onClick={() => setFilterCompleted("due")}
            aria-label="Show due tasks"
          >
            <TbCalendarTime className="chip-icon" />
            <span>Due</span>
            <span className="chip-count">{counts.due}</span>
          </button>
        </div>

        {/* VIEW SWITCHER */}
        <div className="view-switcher">
          {/* 1. Priority Toggle */}
          <button
            className={`view-btn${isGrouped ? " active" : ""}`}
            onClick={() => setIsGrouped(!isGrouped)}
            aria-label="Toggle Priority Board"
            title={isGrouped ? "Disable Priority Board" : "Enable Priority Board"}
          >
            <TbLayersLinked />
          </button>

          <div className="divider-vertical" style={{ width: '1px', height: '24px', background: 'var(--menu-border-color)', margin: '0 4px' }}></div>

          {/* 2. Date Group Selector */}
          <div className="date-group-select-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <TbCalendarTime style={{ margin: '0 8px', opacity: 0.7 }} />
             <select 
                className="group-by-select"
                value={dateGroupBy}
                onChange={(e) => setDateGroupBy(e.target.value)}
                aria-label="Group by Date"
                style={{ paddingLeft: '4px' }}
             >
                <option value="none">None</option>
                <option value="day">By Day</option>
                <option value="week">By Week</option>
                <option value="month">By Month</option>
                <option value="year">By Year</option>
             </select>
          </div>

          <div className="divider-vertical" style={{ width: '1px', height: '24px', background: 'var(--menu-border-color)', margin: '0 4px' }}></div>

          {/* 3. Visual Layout Toggle */}
           <button
            className="view-btn"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            aria-label="Toggle View Mode"
            title={viewMode === "grid" ? "Switch to List" : "Switch to Grid"}
          >
            {viewMode === "grid" ? <TbLayoutGrid /> : <TbList />}
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Click the button to add a task.</p>
        </div>
      ) : (
        <div className={isGrouped ? "tasks-grouped" : "tasks-ungrouped"}>
           {isGrouped ? (
             // PRIORITY COLUMNS
             computedData.map((col) => (
                <div key={col.title} className={`task-group priority-${col.title.split(' ')[0].toLowerCase()} ${collapsedGroups[col.title] ? 'collapsed' : ''}`}>
                  <div 
                    className="group-header" 
                    onClick={() => toggleGroup(col.title)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="group-header-left">
                      <span className="group-toggle-icon">
                          {collapsedGroups[col.title] ? '›' : '‹'}
                      </span>
                      <h3>{col.title}</h3>
                      <span className="group-count">
                         {col.isNested 
                           ? col.content.reduce((acc, g) => acc + g.tasks.length, 0)
                           : col.content.length}
                      </span>
                    </div>
                    <div className="group-line"></div>
                  </div>
                  
                  {!collapsedGroups[col.title] && (
                     <div className="group-body">
                        {col.isNested ? (
                           col.content.map(subGroup => (
                              <div key={subGroup.title} className="date-subgroup">
                                 <h4 className="date-subgroup-header">
                                    {subGroup.title}
                                    <span className="subgroup-count">{subGroup.tasks.length}</span>
                                 </h4>
                                 {renderTaskGrid(subGroup.tasks)}
                              </div>
                           ))
                        ) : (
                           renderTaskGrid(col.content)
                        )}
                        {col.isNested && col.content.length === 0 && <div className="empty-sub">No tasks</div>}
                        {!col.isNested && col.content.length === 0 && <div className="empty-sub">No tasks</div>}
                     </div>
                  )}
                </div>
             ))
           ) : (
             // FLAT / DATE ONLY
             computedData.isNested ? (
                <div className="tasks-date-grouped">
                   {computedData.content.map(subGroup => (
                      <div key={subGroup.title} className="date-group-section">
                         <h3 className="date-group-header">
                            {subGroup.title}
                            <span className="date-group-count">{subGroup.tasks.length}</span>
                         </h3>
                         {renderTaskGrid(subGroup.tasks)}
                      </div>
                   ))}
                   {computedData.content.length === 0 && <div className="empty-state"><p>No tasks match.</p></div>}
                </div>
             ) : (
                renderTaskGrid(computedData.content)
             )
           )}
           
           {!isGrouped && !computedData.isNested && computedData.content.length === 0 && (
              <div className="empty-state"><p>No tasks match.</p></div>
           )}
        </div>
      )}

      <NewTask 
        onCreate={createTask} 
        isOpen={showNewTask}
        onOpen={() => setShowNewTask(true)}
        onClose={() => setShowNewTask(false)}
      />

      {openTask && (
        <TaskOpen
          task={openTask}
          onClose={() => setOpenTask(null)}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}
