# Настраиваем тестирование производительности для своего проекта используя K6 (часть 1)

![perfomance_dashboard](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/perfomance_dashboard.png)

Задумывались ли вы когда-нибудь о том, как проверить, сможет ли ваша инфраструктура выдержать высокую нагрузку пользователей? Хотели ли вы провести тестирование производительности без необходимости разбираться в сложных конфигурациях и изучать современные инструменты тестирования? Интересовались ли вы, как написать сценарий для различных видов тестирования?

В этой статье я расскажу вам, как настроить тестирование производительности на своем проекте, организовать мониторинг сервисов, а также о том, как автоматизировать процесс тестирования производительности с использованием инструмента K6.

# Что такое тестирование производительности

**Тестирование производительности** — это процесс оценки работы приложения под различными уровнями нагрузки, имитирующий условия реальной эксплуатации. Цель тестирования — выявить, как система ведет себя под различными уровнями нагрузки, и найти узкие места, которые могут привести к сбоям или снижению производительности.

## **Почему нагрузочное тестирование важно**

### Оценка производительности

Тестирование позволяет оценить, как система справляется с разными уровнями нагрузки. Это важно для понимания пределов возможностей приложения и его компонентов, таких как серверы, базы данных и сети. Зная эти пределы, можно принять меры для их повышения или распределения нагрузки.

### **Выявление узких мест**

Нагрузочное тестирование помогает выявить узкие места в системе, которые могут стать причиной снижения производительности или даже сбоев при высоких нагрузках. Это позволяет заранее идентифицировать и устранить потенциальные проблемы, прежде чем они проявятся в реальных условиях эксплуатации.

### Обеспечение стабильности

Стабильность приложения под нагрузкой критически важна для пользователей. Нагрузочное тестирование помогает убедиться, что приложение продолжает работать корректно даже при высоком уровне запросов, не вызывая ошибок или сбоев.

### Планирование масштабирования

Результаты нагрузочного тестирования могут помочь в планировании масштабирования системы. Вы сможете определить, когда и какие ресурсы необходимо добавить для поддержания производительности при увеличении числа пользователей или объема данных.

### **Экономия времени и денег**

Выявление и устранение проблем производительности на ранних стадиях разработки и тестирования значительно дешевле, чем их исправление в рабочей среде. Нагрузочное тестирование помогает избежать дорогостоящих простоев и улучшить общий пользовательский опыт.

### **Улучшение пользовательского опыта**

Высокая производительность и стабильность приложения под нагрузкой напрямую влияют на удовлетворенность пользователей. Нагрузочное тестирование помогает создать более быстрые, надежные и отзывчивые приложения, что способствует положительному пользовательскому опыту.

### Улучшение Пользовательского Опыта

Высокая производительность и стабильность приложения под нагрузкой напрямую влияют на удовлетворенность пользователей. Нагрузочное тестирование помогает создать более быстрые, надежные и отзывчивые приложения, что способствует положительному пользовательскому опыту.

## Виды тестирования производительности

Существует разные типов тестов, предназначенных для разных целей тестирования производительности.

### **Нагрузочное тестирование**

исследует способность системы обрабатывать растущие объёмы ожидаемой реалистичной нагрузки, порождаемой запросами на совершение транзакций контролируемым числом одновременно работающих пользователей или процессов.

### **Стресс-тестирование**

исследует способность системы или компонента обрабатывать пиковые объёмы нагрузки на пределе или за пределами ожидаемой или предусмотренной спецификацией пропускной способности. Стрессовое тестирование также используется для оценки работоспособности системы в условиях уменьшенной доступности ресурсов, таких как вычислительные мощности, полоса пропускания сети, память.

### **Тестирование на выдержку**

непрерывное нагрузочное тестирование системы и мониторинг утечек памяти и поведения системы.

### **Пиковое тестирование**

исследует способность системы правильно реагировать на внезапные всплески нагрузки до пикового уровня и затем вернуться в устойчивое состояние.

### **Тестирование конфигурации**

исследует изменение конфигурации, чтобы увидеть, как система ведет себя в различных конфигурациях, под нагрузкой.

### Breakpoint тестирование

целью которого является определение ограничений системы.

# Поработаем с примером

Предположим, команда разработала сервис под названием Store App, который предоставляет backend для управления списком пользователей, продуктов и заказов. Этот сервис был упакован в Docker Compose и развернут на стейджинговой (stage) среде. Наша задача — определить максимальное количество пользователей, которое сервис может выдержать перед тем, как начнет испытывать сбои или падения. 

Сервис предоставляет три эндпоинта: users, products и orders. также у сервиса есть своя база данных.

Мы будем работать только с одним эндпоинтом - users.

## Код приложения

### models.js

```jsx
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {});

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {});

const Order = sequelize.define('Order', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {});

const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database & tables created!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

syncDatabase();

module.exports = { User, Product, Order, sequelize };
```

### Server.js

```jsx
const express = require('express');
const bodyParser = require('body-parser');
const { User, Product, Order, sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

app.get('/orders', async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Dockerfile.yml

```docker
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY app .

CMD [ "node", "server.js" ]
```

### compose.yml

```docker
version: '3.9'

services:
  postgres:
    build:
      dockerfile: build/Dockerfile.postgres
    container_name: store_db
    environment:
      POSTGRES_DB: store_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: '100m'
        reservations:
          cpus: '0.50'
          memory: '60m'
  app:
    build: 
      dockerfile: build/Dockerfile.node
    container_name: store_app
    environment:
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: store_db
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: '100m'
        reservations:
          cpus: '0.25'
          memory: '50m'
```

# Настройка мониторинга

Мониторинг позволяет отслеживать состояние системы в реальном времени, анализировать производительность и выявлять потенциальные проблемы. Без мониторинга невозможно провести полноценное тестирование производительности, так как нужно понимать, как система реагирует на нагрузку и где могут возникнуть проблемы.

Для настройки мониторинга нам понадобятся:

- **Prometheus**: инструментарий для мониторинга и аналитики систем, который также является базой данных временных рядов, в которой будут храниться наши метрики.
- **Node Exporter**: инструмент, который собирает метрики и информацию о ресурсах системы с узлов (node).
- **Grafana**: популярный инструмент для визуализации данных и мониторинга. Он обеспечивает возможность создавать красивые и интерактивные дашборды на основе данных из различных источников, включая Prometheus, InfluxDB, Graphite и многие другие.
- **cAdvisor**: инструмент для мониторинга ресурсов и производительности контейнеров. Он предоставляет информацию о использовании CPU, памяти, сети и диска для контейнеров, работающих на хосте.

Есть разные способы настройки этих инструментов ровно как и есть много разных инструментов для мониторинга. В моем примере я выбрал те, что перечислил и буду использовать docker compose для их развертки. Также для полноценной картины не хватает мониторинга базы данных, но в рамках этой статья мы не будем его настраивать.

Конфигурация для мониторинга получилась следующая:

### prometheus

```docker
...
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - 9090:9090
    volumes:
      - ./configs/prometheus:/etc/prometheus
 # будет доступен по адресу http://localhost:9090
 ...
```

### node_exporter

```docker
  ...
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node_exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - 9100:9100
  # будет доступен по адресу http://localhost:9100
  ...
```

### grafana

```docker
  ...
  grafana:
    image: grafana/grafana
    container_name: grafana
    ports:
      - 3000:3000
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=grafana
    volumes:
      - ./configs/grafana/provisining:/etc/grafana/provisioning
      - ./configs/grafana/dashboards/cadvisor.yml:/usr/lib/dashboards/cadvisor.json
      - ./configs/grafana/dashboards/node_exporter.yml:/usr/lib/dashboards/node_exporter.json
 # будет доступен по адресу http://localhost:3000
 ...
 
```

### cadvisor

```docker
  ...
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
    - 8080:8080
    volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:rw
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
  # будет доступен по адресу http://localhost:8080
   ...
```

После развертывания инструментов, вы сможете получить графики производительности в Grafana:

### Node exporter

![node_exporter_dashboard](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/node_exporter_dashboard.png)

### Cadvisor

![cadvisor_dashboard](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/cadvisor_dashboard.png)

# Настраиваем тестирование производительности с помощью инструмента k6

[K6](https://grafana.com/docs/k6/latest/) — это инструмент нагрузочного тестирования с открытым исходным кодом, конфигурация которого пишется на JavaScript. В этой части мы рассмотрим, как настроить K6 для выполнения тестирования производительности и интеграции с InfluxDB для хранения результатов.

## Установка k6

Процесс установки описан в [официальной документации](https://grafana.com/docs/k6/latest/set-up/install-k6/)

## Пишем скрипты для k6

Для нашей задачи напишем скрипт, который проведет breakpoint тестирование системы.

### breakpoint_testing.js

```bash
import http from 'k6/http';
import { sleep, check } from 'k6';

# В этом блоке мы настраиваем нагрузку, которую будем подавать на систему
# Здесь мы настроили тест длительностью в 15 минут, 
# в течение которого количество пользователей (target) будет постепенно увеличиваться.
export const options = {
  stages: [
    { duration: '15m', target: 3000 },
  ],
};

# в этом блоке формируется запрос к ресурсу
export default () => {
  const response = http.get('http://localhost:3001/users');

# Check проверяют логические условия в тесте.
# в данном случае проверяется, что статус код равен 200
  check(response, {
    "response code was 200": (res) => res.status == 200,
   });

  sleep(1);
};
```

запустим наш скрипт с помощью следующей команды:

```bash
k6 run app/tests/perfomance/breakpoint_testing.js
```

По окончании работы скрипты получаем следующий отчет в CLI
 

![k6_cli_report](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/k6_cli_report.png)

и следующие графики

![cadvisor_report](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/cadvisor_report.png)

![node_exporter_report](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/node_exporter_report.png)

Если смотреть на отчет k6 понимаем что не хватает графиков. Давайте их добавим 

## Готовим отчет по тестированию производительности с помощью InfluxDB и grafana.

[**InfluxDB**](https://www.influxdata.com/) — это база данных временных рядов, созданная для высокопроизводительной обработки данных с отметками времени. K6 предоставляет встроенный метод для записи данных в InfluxDB.

В рамках этой статьи поднимем InfluxDB в контейнере:

```bash
  ...
  influxdb:
    image: influxdb:1.8
    container_name: influxdb
    ports:
      - '8086:8086'
    environment:
      - INFLUXDB_DB=perfomance_db
      - INFLUXDB_ADMIN_USER=admin
      - INFLUXDB_ADMIN_PASSWORD=influx
  ...
```

Далее в grafana формируется следующий график:

### InfluxDB

![k6_influx_report](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/k6_influx_report.png)

Давайте ещё раз выполним скрипт, но уже с выводом в InfluxDB.

Делается это следующий образом:

```bash
k6 run app/tests/perfomance/breakpoint_testing.js --out influxdb=http://localhost:8086/perfomance_db
```

В итоге мы получаем следующий график, который показывает, что при количестве пользователей, равном 350, сервис начинает испытывать проблемы.

![k6_influx_report2](https://github.com/Ilshatikoo/performance-testing-article-1/blob/main/img/k6_influx_report2.png)

Это было краткое введение в тестирование производительности. В следующих статьях я подробно расскажу:

- Какую информацию нужно собрать перед проведением тестирования производительности.
- Более подробно расскажу как собрать мониторинг и из чего он состоит.
- Как настроить k6 для более лучшей работы.
- Как настроить другие типы тестирования производительности.
- Как настроить и автоматизировать тестирование производительности в рамках CI/CD.
