import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// プロジェクト作成のバリデーションスキーマ
const createProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').max(100),
  description: z.string().max(2000).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, '有効なカラーコードを入力してください')
    .default('#3B82F6'),
})

// タスク作成のバリデーションスキーマ
const createTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200),
  description: z.string().optional(),
  status: z
    .enum(['todo', 'in_progress', 'done', 'blocked'])
    .default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.number().optional(),
  projectId: z.string().min(1, 'プロジェクトIDは必須です'),
  assigneeId: z.string().optional(),
})

// ログインのバリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
})

// サインアップのバリデーションスキーマ
const signupSchema = z
  .object({
    name: z.string().min(1, '名前は必須です').max(100),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上である必要があります')
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

describe('createProjectSchema', () => {
  it('should validate correct project data', () => {
    const validData = {
      name: 'Test Project',
      description: 'Test Description',
      color: '#FF5733',
    }

    const result = createProjectSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require project name', () => {
    const invalidData = {
      description: 'Test Description',
      color: '#FF5733',
    }

    const result = createProjectSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      // Check that there's an error related to the name field
      const nameError = result.error.issues.find(issue => issue.path.includes('name'))
      expect(nameError).toBeDefined()
    }
  })

  it('should reject empty project name', () => {
    const invalidData = {
      name: '',
      description: 'Test Description',
      color: '#FF5733',
    }

    const result = createProjectSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject project name longer than 100 characters', () => {
    const invalidData = {
      name: 'a'.repeat(101),
      description: 'Test Description',
      color: '#FF5733',
    }

    const result = createProjectSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept optional description', () => {
    const validData = {
      name: 'Test Project',
      color: '#FF5733',
    }

    const result = createProjectSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject description longer than 2000 characters', () => {
    const invalidData = {
      name: 'Test Project',
      description: 'a'.repeat(2001),
      color: '#FF5733',
    }

    const result = createProjectSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate color code format', () => {
    const validData = {
      name: 'Test Project',
      color: '#ABCDEF',
    }

    const result = createProjectSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid color code', () => {
    const invalidData = {
      name: 'Test Project',
      color: 'invalid',
    }

    const result = createProjectSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should use default color when not provided', () => {
    const validData = {
      name: 'Test Project',
    }

    const result = createProjectSchema.parse(validData)
    expect(result.color).toBe('#3B82F6')
  })
})

describe('createTaskSchema', () => {
  it('should validate correct task data', () => {
    const validData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: Date.now(),
      projectId: 'project-123',
      assigneeId: 'user-123',
    }

    const result = createTaskSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require title', () => {
    const invalidData = {
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty title', () => {
    const invalidData = {
      title: '',
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject title longer than 200 characters', () => {
    const invalidData = {
      title: 'a'.repeat(201),
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should require projectId', () => {
    const invalidData = {
      title: 'Test Task',
    }

    const result = createTaskSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate status enum', () => {
    const validData = {
      title: 'Test Task',
      status: 'in_progress' as const,
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid status', () => {
    const invalidData = {
      title: 'Test Task',
      status: 'invalid',
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate priority enum', () => {
    const validData = {
      title: 'Test Task',
      priority: 'urgent' as const,
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid priority', () => {
    const invalidData = {
      title: 'Test Task',
      priority: 'invalid',
      projectId: 'project-123',
    }

    const result = createTaskSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should use default status when not provided', () => {
    const validData = {
      title: 'Test Task',
      projectId: 'project-123',
    }

    const result = createTaskSchema.parse(validData)
    expect(result.status).toBe('todo')
  })

  it('should use default priority when not provided', () => {
    const validData = {
      title: 'Test Task',
      projectId: 'project-123',
    }

    const result = createTaskSchema.parse(validData)
    expect(result.priority).toBe('medium')
  })
})

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    }

    const result = loginSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require email', () => {
    const invalidData = {
      password: 'password123',
    }

    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    }

    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should require password', () => {
    const invalidData = {
      email: 'test@example.com',
    }

    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should require password to be at least 8 characters', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
    }

    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  it('should validate correct signup data', () => {
    const validData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    const result = signupSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    const result = signupSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty name', () => {
    const invalidData = {
      name: '',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    const result = signupSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject name longer than 100 characters', () => {
    const invalidData = {
      name: 'a'.repeat(101),
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    const result = signupSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate email format', () => {
    const invalidData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    }

    const result = signupSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should require password to be at least 8 characters', () => {
    const invalidData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'short',
      confirmPassword: 'short',
    }

    const result = signupSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should require passwords to match', () => {
    const invalidData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    }

    const result = signupSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('パスワードが一致しません')
    }
  })
})
