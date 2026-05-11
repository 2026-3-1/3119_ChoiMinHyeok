# SEC101 P1 — 데이터 모델

> PostgreSQL + Prisma ORM  
> 총 **16개 테이블**, **7개 Enum**

---

## Enum 정의

| Enum | 값 |
|------|----|
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
| `LecturePlaybackEventType` | STARTED, PROGRESS, RESUMED, COMPLETED |
| `ReportType` | COPYRIGHT, WRONG_INFO, OTHER |

---

## 테이블 구조

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | 자동 증가 |
| name | String | 사용자 이름 |
| email | String UNIQUE | 이메일 |
| password | String | bcrypt 해시 |
| role | Roles | 기본값 STUDENT |
| description | String? | 자기소개 |
| created_at | DateTime | 가입일 |
| updated_at | DateTime | 수정일 |

### categories
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| name | String | 카테고리명 |
| created_at | DateTime | |

### courses
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| title | String | 강의 제목 |
| description | String | 설명 |
| instructor_id | Int FK→users | |
| thumbnail | String | 썸네일 URL |
| difficulty | Difficulty | |
| category_id | Int FK→categories | |
| slug | String UNIQUE | URL용 식별자 |
| price | Int | 가격 (원) |
| rating | Float | 평균 평점 (기본 0) |
| max_capacity | Int | 최대 수강 인원 (기본 30) |
| status | CourseLifecycleStatus | 기본값 **DRAFT** |
| created_at / updated_at | DateTime | |

### chapter
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| course_id | Int FK→courses | |
| title | String | 챕터 제목 |
| position | Int | 순서 |
| UNIQUE | (course_id, position) | |

### lectures
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| chapter_id | Int FK→chapter | |
| title | String | |
| video_url | String | YouTube URL 또는 직접 URL |
| thumbnail_url | String | |
| duration | Int | 재생시간 (초) |
| position | Int | 순서 |
| is_published | Boolean | 공개 여부 (기본 false) |
| UNIQUE | (chapter_id, position) | |

### lecture_attachment
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| lecture_id | Int FK→lectures | CASCADE 삭제 |
| filename | String | 원본 파일명 |
| stored_name | String UNIQUE | 서버 저장 파일명 |
| mime_type | String | |
| size | Int | 바이트 |

### cart_items
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| course_id | Int FK→courses | |
| status | CartItemStatus | 기본값 ACTIVE |
| added_at | DateTime | |

### orders
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| order_number | String UNIQUE | |
| provider | PaymentProvider | 기본값 DEMO |
| status | OrderStatus | 기본값 PENDING |
| total_amount | Int | |
| paid_amount | Int | |

### order_items
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| order_id | Int FK→orders | |
| course_id | Int FK→courses | |
| price | Int | 결제 시점 가격 |
| status | OrderItemStatus | 기본값 PENDING |

### payment_transactions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| order_id | Int FK→orders | |
| user_id | Int FK→users | |
| transaction_type | PaymentTransactionType | |
| status | PaymentTransactionStatus | |
| amount | Int | |

### enrollments
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| course_id | Int FK→courses | |
| order_item_id | Int? UNIQUE FK | |
| status | EnrollmentStatus | 기본값 ACTIVE |
| enrolled_at | DateTime | |
| INDEX | (user_id, course_id, status) | |

### lectures_progress
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| lecture_id | Int FK→lectures | |
| last_position | Int | 마지막 시청 위치 (초) |
| watched_seconds | Int | 총 시청 시간 (초) |
| progress | Int | 진도율 (%) |
| is_completed | Boolean | |
| UNIQUE | (user_id, lecture_id) | |

### lecture_bookmark
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| lecture_id | Int FK→lectures | |
| note | String? | 메모 |
| position | Int | 북마크 시점 (초) |

### lecture_comment
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| lecture_id | Int FK→lectures | |
| title | String? | (선택) |
| content | String | 댓글 내용 |
| create_at | DateTime | |

### course_comment (강의 리뷰)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| user_id | Int FK→users | |
| course_id | Int FK→courses | |
| title | String | |
| content | String | |
| star | Int | 평점 (0-5) |
| UNIQUE | (user_id, course_id) | 1인 1리뷰 |

### course_report
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int PK | |
| course_id | Int | |
| user_id | Int | |
| type | ReportType | |
| content | String | |
| is_resolved | Boolean | 처리 여부 (기본 false) |

---

## 주요 관계 다이어그램

```
users ──< enrollments >── courses ──< chapter ──< lectures
                                                      │
                                          ┌───────────┼───────────┐
                                  lecture_attachment  │     lecture_comment
                                              lectures_progress
                                              lecture_bookmark
                                              lecture_playback_history

users ──< cart_items >── courses
users ──< orders ──< order_items >── courses
orders ──< payment_transactions
```
