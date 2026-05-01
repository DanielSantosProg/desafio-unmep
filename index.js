// Importação do file system para gerar o arquivo result.json
const fs = require("fs");

// Lê o arquivo data.json e guarda os dados numa constante
const file = fs.readFileSync("data.json", "utf-8");
const data = JSON.parse(file);

// Definição de variáveis
let result = {};
let ignoredRecords = 0;

// 2.1 Obtem a quantidade de dados ignorados
data.forEach(item => {
  item.minutes <= 0 && ignoredRecords++;
});

// 2.2 Agrupa as tasks por id e faz a soma da quantidade de minutos trabalhados
const initialTasks = data.filter(item => item.minutes > 0).reduce((acc, task) => {
    const taskById = acc.find(t => t.taskId === task.taskId);

    if (taskById) {
      taskById.minutes += task.minutes;
    } else {
      acc.push({ taskId: task.taskId, taskName: task.taskName, minutes: task.minutes });
    }

    return acc;
  }, []);

// Gera constante com  o total geral de minutos trabalhados
const totalMinutes = data.filter(item => item.minutes > 0).reduce((acc, task) => acc + task.minutes, 0);

// 2.4 Insere a propriedade percentage de cada task e ordena por ordem descendente
const tasks = initialTasks.map(task => ({
  taskId: task.taskId,
  taskName: task.taskName,
  totalMinutes: task.minutes,
  percentage: `${(task.minutes/totalMinutes*100).toFixed(2)}%`
})).sort((currTask, nextTask) => {
      if (nextTask.totalMinutes !== currTask.totalMinutes) {
        return nextTask.totalMinutes - currTask.totalMinutes;
      }
      return currTask.taskId - nextTask.taskId;
    });

// 2.3 Obtem a tarefa mais trabalhada
const mostWorkedTask = tasks && tasks.length > 0 ? tasks[0] : null;

// 2.5 Obtem as 3 tasks com mais horas trabalhadas
const top3TasksPercentage = tasks.slice(0, 3).map(task => {
  const newTask = { ...task };
  delete newTask.totalMinutes;
  return newTask;
});

// 2.6 Obtem os 3 funcionários com maior total de minutos trabalhados
const top3Employees = data.filter(item => item.minutes > 0).reduce((acc, task) => {
    const taskByEmployee = acc.find(u => u.userId === task.userId);

    if (taskByEmployee) {
      taskByEmployee.totalMinutes += task.minutes;
    } else {
      acc.push({ userId: task.userId, userName: task.userName, totalMinutes: task.minutes });
    }

    return acc;
  }, []).sort((currEmployee, nextEmployee) => {
          if (nextEmployee.totalMinutes !== currEmployee.totalMinutes) {
            return nextEmployee.totalMinutes - currEmployee.totalMinutes;
          }
          return currEmployee.taskId - nextEmployee.taskId;
        }).slice(0,3);

// Obtem a quantidade de tasks distintas de cada funcionário
const tasksPerEmployee = data.filter(item => item.minutes > 0).reduce((acc, task) => {
  const user = acc.find(u => u.userId === task.userId);

  if (user) {
    if (!user.taskIds.includes(task.taskId)) {
      user.taskIds.push(task.taskId);
      user.distinctTasks += 1;
    }
  }else {
    acc.push({
      userId: task.userId,
      userName: task.userName,
      distinctTasks: 1,
      taskIds: [task.taskId]
    });
  }

  return acc;
}, []);

// Ordena os ids das tasks de cada funcionário
tasksPerEmployee.forEach(employee => {
  employee.taskIds.sort((curr, next) => curr - next);
});

// 2.7 Define o funcionário com mais tasks distintas com base na ordenação
const mostDistinctUserOnTasks = tasksPerEmployee.sort((curr, next) => {
  if (next.distinctTasks !== curr.distinctTasks) {
    return next.distinctTasks - curr.distinctTasks;
  }
  
  return curr.userId - next.userId;
})[0];

result = {
  totalMinutes,
  tasks,
  mostWorkedTask,
  top3TasksPercentage,
  top3Employees,
  mostDistinctUserOnTasks,
  ignoredRecords
};

fs.writeFileSync("result.json", JSON.stringify(result, null, 2));