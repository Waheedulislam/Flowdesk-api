# FlowDesk - Database Design

## Entities

### 1. User

- id
- name
- email
- password
- avatar
- isVerified
- status
- createdAt
- updatedAt

---

### 2. Workspace

- id
- name
- slug
- logo
- description
- ownerId
- createdAt
- updatedAt

---

### 3. WorkspaceMember

- id
- workspaceId
- userId
- role
- joinedAt

---

### 4. Invitation

- id
- workspaceId
- email
- role
- token
- status
- expiresAt

---

### 5. Project

- id
- workspaceId
- name
- description
- status
- createdBy
- createdAt
- updatedAt

---

### 6. ProjectMember

- id
- projectId
- userId
- role

---

### 7. Task

- id
- projectId
- title
- description
- priority
- status
- assignedTo
- createdBy
- dueDate
- createdAt
- updatedAt

---

### 8. TaskComment

- id
- taskId
- userId
- comment
- createdAt

---

### 9. Notification

- id
- userId
- title
- message
- isRead
- createdAt

---

### 10. ActivityLog

- id
- userId
- action
- entity
- entityId
- createdAt

---

### 11. Subscription

- id
- workspaceId
- plan
- status
- startDate
- endDate