# Architecture Overview

```mermaid
flowchart TB
    subgraph Client[Client Layer]
        Mobile[Mobile sales capture UI]
        Dashboard[Manager KPI dashboard]
        Staff[Staff performance views]
    end

    subgraph App[Application Layer]
        Capture[Walk-in capture]
        Validation[Input validation and normalization]
        Analytics[Conversion and KPI analytics]
        LostSales[Lost-sales insights]
        FollowUps[Follow-up management]
        Auth[Authentication and authorization]
    end

    subgraph Data[Data Layer]
        WalkIns[(Walk-in records)]
        Sales[(Sales and conversion data)]
        Activities[(Follow-up activities)]
        Users[(Staff and user profiles)]
    end

    subgraph Platform[Platform Services]
        API[TypeScript API/services]
        Jobs[Background calculations and reminders]
        Notifications[Notifications]
    end

    Mobile --> Auth
    Dashboard --> Auth
    Staff --> Auth

    Mobile --> Capture
    Capture --> Validation
    Validation --> API

    Dashboard --> Analytics
    Staff --> Analytics
    Dashboard --> LostSales
    Staff --> FollowUps

    API --> WalkIns
    API --> Sales
    API --> Activities
    API --> Users

    Analytics --> WalkIns
    Analytics --> Sales
    LostSales --> WalkIns
    LostSales --> Sales
    FollowUps --> Activities
    FollowUps --> Users

    Jobs --> Analytics
    Jobs --> FollowUps
    Jobs --> Notifications
    Notifications --> Staff
    Notifications --> Mobile
```

## Flow summary

- Sales staff capture walk-in and customer details through the mobile interface.
- The application validates and normalizes submitted data before persisting it.
- KPI analytics combine walk-in, sales, and activity data to calculate conversion and staff-performance metrics.
- Lost-sales analysis highlights missed opportunities and supports follow-up actions.
- Background jobs refresh derived metrics and reminders, while notifications keep staff informed.
- Authentication and authorization protect staff and management views according to user permissions.
