# SEC101 P1 — ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    users {
        int id PK
        string name
        string email
        string password
        Roles role
        string description
        datetime updated_at
        datetime created_at
    }

    categories {
        int id PK
        string name
        datetime created_at
    }

    courses {
        int id PK
        string title
        string description
        int instructor_id FK
        string thumbnail
        Difficulty difficulty
        int category_id FK
        string slug
        int price
        float rating
        int max_capacity
        int min_enrollment
        CourseLifecycleStatus status
        datetime canceled_at
        CancellationReason cancel_reason
        datetime created_at
        datetime updated_at
    }

    chapter {
        int id PK
        int course_id FK
        string title
        int position
    }

    lectures {
        int id PK
        int chapter_id FK
        string title
        string video_url
        string thumbnail_url
        int duration
        int position
        boolean is_published
        datetime created_at
    }

    lecture_attachment {
        int id PK
        int lecture_id FK
        string filename
        string stored_name
        string mime_type
        int size
        datetime created_at
    }

    cart_items {
        int id PK
        int user_id FK
        int course_id FK
        CartItemStatus status
        datetime added_at
        datetime updated_at
        datetime checked_out_at
    }

    orders {
        int id PK
        int user_id FK
        string order_number
        PaymentProvider provider
        string provider_order_id
        OrderStatus status
        int total_amount
        int paid_amount
        int refunded_amount
        datetime created_at
        datetime paid_at
        datetime canceled_at
        datetime updated_at
    }

    order_items {
        int id PK
        int order_id FK
        int user_id FK
        int course_id FK
        int price
        OrderItemStatus status
        datetime enrolled_at
        datetime canceled_at
        int refund_amount
        CancellationReason cancellation_reason
        datetime created_at
        datetime updated_at
    }

    payment_transactions {
        int id PK
        int order_id FK
        int user_id FK
        PaymentProvider provider
        PaymentTransactionType transaction_type
        PaymentTransactionStatus status
        int amount
        string payment_key
        string transaction_key
        string reason
        json metadata
        datetime created_at
        datetime approved_at
        datetime canceled_at
    }

    enrollments {
        int id PK
        int user_id FK
        int course_id FK
        int order_item_id FK
        EnrollmentStatus status
        boolean is_canceled
        datetime enrolled_at
        datetime canceled_at
        CancellationReason cancellation_reason
    }

    enrollment_history {
        int id PK
        int enrollment_id FK
        int user_id FK
        int course_id FK
        EnrollmentHistoryType event_type
        string reason
        datetime created_at
    }

    course_comment {
        int id PK
        string title
        string content
        int star
        int user_id FK
        int course_id FK
        datetime create_at
        datetime updated_at
    }

    lecture_comment {
        int id PK
        string title
        string content
        int star
        int user_id FK
        int lecture_id FK
        datetime create_at
    }

    lectures_progress {
        int id PK
        int user_id FK
        int lecture_id FK
        int last_position
        int watched_seconds
        int progress
        boolean is_completed
        datetime updated_at
    }

    lecture_playback_history {
        int id PK
        int user_id FK
        int lecture_id FK
        LecturePlaybackEventType event_type
        int from_second
        int to_second
        int progress
        datetime created_at
    }

    lecture_bookmark {
        int id PK
        int user_id FK
        int lecture_id FK
        string note
        int position
        datetime created_at
        datetime updated_at
    }

    course_report {
        int id PK
        int course_id
        int user_id
        ReportType type
        string content
        boolean is_resolved
        datetime created_at
    }

    %% ─── 사용자 관계 ──────────────────────────────────────────────
    users ||--o{ cart_items            : "담기"
    users ||--o{ orders                : "주문"
    users ||--o{ order_items           : "주문 항목"
    users ||--o{ enrollments           : "수강 등록"
    users ||--o{ enrollment_history    : "수강 이력"
    users ||--o{ course_comment        : "강의 리뷰"
    users ||--o{ lecture_comment       : "강의 댓글"
    users ||--o{ lectures_progress     : "진도 기록"
    users ||--o{ lecture_playback_history : "재생 이력"
    users ||--o{ lecture_bookmark      : "북마크"
    users ||--o{ payment_transactions  : "결제 내역"

    %% ─── 카테고리 → 강의 ─────────────────────────────────────────
    categories ||--o{ courses          : "분류"

    %% ─── 강의(Course) 트리 ──────────────────────────────────────
    courses ||--o{ chapter             : "챕터"
    courses ||--o{ cart_items          : "장바구니"
    courses ||--o{ order_items         : "주문 항목"
    courses ||--o{ enrollments         : "수강"
    courses ||--o{ enrollment_history  : "수강 이력"
    courses ||--o{ course_comment      : "리뷰"

    %% ─── 챕터 → 강의(Lecture) ───────────────────────────────────
    chapter ||--o{ lectures            : "강의"

    %% ─── 강의(Lecture) 자식 ─────────────────────────────────────
    lectures ||--o{ lecture_attachment    : "첨부파일"
    lectures ||--o{ lectures_progress     : "진도"
    lectures ||--o{ lecture_playback_history : "재생 이력"
    lectures ||--o{ lecture_bookmark      : "북마크"
    lectures ||--o{ lecture_comment       : "댓글"

    %% ─── 주문 트리 ───────────────────────────────────────────────
    orders   ||--o{ order_items           : "항목"
    orders   ||--o{ payment_transactions  : "결제"

    %% ─── 주문 항목 → 수강 등록 ──────────────────────────────────
    order_items ||--o| enrollments        : "수강 등록"

    %% ─── 수강 등록 → 이력 ───────────────────────────────────────
    enrollments ||--o{ enrollment_history : "이력"
```

---

## Enum 목록

| Enum | 값 |
|---|---|
| `Roles` | STUDENT, INSTRUCTOR, ADMIN |
| `Difficulty` | EASY, MEDIUM, HARD |
| `CourseLifecycleStatus` | DRAFT, OPEN, CANCELED |
| `CartItemStatus` | ACTIVE, CHECKED_OUT, REMOVED |
| `EnrollmentStatus` | ACTIVE, CANCELED, REFUNDED |
| `OrderStatus` | PENDING, PAID, PARTIALLY_REFUNDED, REFUNDED, CANCELED |
| `OrderItemStatus` | PENDING, ENROLLED, CANCELED, REFUNDED |
| `PaymentProvider` | TOSS, DEMO |
| `PaymentTransactionType` | PAYMENT, REFUND, CANCEL |
| `PaymentTransactionStatus` | COMPLETED, FAILED, CANCELED |
| `CancellationReason` | USER_REQUEST, COURSE_CANCELED, CAPACITY_EXCEEDED, UNDER_ENROLLED, OTHER |
| `EnrollmentHistoryType` | ENROLLED, CANCELED, REFUNDED |
| `LecturePlaybackEventType` | STARTED, PROGRESS, RESUMED, COMPLETED |
| `ReportType` | COPYRIGHT, WRONG_INFO, OTHER |

---

## 핵심 관계 요약

```
users ──┬──> cart_items ──> courses
        ├──> orders ──> order_items ──> enrollments ──> enrollment_history
        ├──>            payment_transactions
        ├──> course_comment ──> courses
        ├──> lecture_comment ──> lectures
        ├──> lectures_progress ──> lectures
        ├──> lecture_playback_history ──> lectures
        └──> lecture_bookmark ──> lectures

categories ──> courses ──> chapter ──> lectures ──┬──> lecture_attachment
                                                   ├──> lectures_progress
                                                   ├──> lecture_playback_history
                                                   ├──> lecture_bookmark
                                                   └──> lecture_comment
```
