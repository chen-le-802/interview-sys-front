import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义错题本数据结构
export interface Book {
  id: number
  name: string
  type?: string
  count: number
  color?: string
  createTime: string
}

// 定义错题数据结构
export interface ErrorQuestion {
  id: number
  bookId: number
  title: string
  content: string
  options: string[]
  correctAnswer: string
  userAnswer: string
  explanation: string
  knowledgePoint: string
  relatedQuestion: string
  tags: string[]
  date: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'unsolved' | 'solved'
  source?: string // 题目来源
}

// 定义题目数据结构（用于从测试页面传入）
export interface Question {
  title: string
  options: string[]
  correctAnswer: string
  explanation: string
  knowledgePoint: string
  relatedQuestion: string
}

export const useErrorNotebookStore = defineStore('errorNotebook', () => {
  // 状态
  const books = ref<Book[]>([
    { 
      id: 1, 
      name: '前端错题', 
      type: 'front', 
      count: 0, 
      color: '#DE868F',
      createTime: '2024-01-15'
    },
    { 
      id: 2, 
      name: '后端错题', 
      type: 'back', 
      count: 0, 
      color: '#FCCA00',
      createTime: '2024-02-01'
    },
    { 
      id: 3, 
      name: '运维错题', 
      type: 'ops', 
      count: 0, 
      color: '#6C6C6C',
      createTime: '2024-02-15'
    }
  ])

  const errors = ref<ErrorQuestion[]>([
    // {
    //   id: 1,
    //   bookId: 1,
    //   title: '1.下列关于进程和线程的描述，正确的是：',
    //   content: '进程和线程的基本概念理解',
    //   options: [
    //     'A. 进程是任务执行的基本单位，线程是资源分配的基本单位',
    //     'B. 进程是资源分配的基本单位，线程是任务执行的基本单位',
    //     'C. 进程和线程都是资源分配的基本单位',
    //     'D. 进程和线程都是任务执行的基本单位'
    //   ],
    //   correctAnswer: 'B',
    //   userAnswer: 'A',
    //   explanation: '进程是操作系统资源分配的基本单位，拥有独立的内存空间；线程是进程内的任务执行单位，共享所属进程的资源。',
    //   knowledgePoint: '进程与线程',
    //   relatedQuestion: '在Linux系统中，执行fork()系统调用后，父进程和子进程的关系是什么？',
    //   tags: ['Vue3', '响应式'],
    //   date: '2024-03-15',
    //   difficulty: 'medium',
    //   status: 'unsolved'
    // },
    // {
    //   id: 2,
    //   bookId: 1,
    //   title: '2.关于进程和线程的资源管理和通信机制，下列说法错误的是：',
    //   content: '进程间通信机制的理解',
    //   options: [
    //     'A. 进程间通信需要使用IPC机制，如管道、信号量、共享内存等',
    //     'B. 线程可以直接读写进程内存，但需要同步控制避免竞态条件',
    //     'C. 进程切换开销较高，因为需要切换虚拟地址空间',
    //     'D. 线程间可以直接共享文件句柄和系统资源'
    //   ],
    //   correctAnswer: 'D',
    //   userAnswer: 'C',
    //   explanation: '线程共享所属进程的资源，包括内存空间，但文件句柄等系统资源是进程级别的。',
    //   knowledgePoint: '进程间通信',
    //   relatedQuestion: '请比较管道、消息队列、共享内存三种IPC机制的特点',
    //   tags: ['React', '性能'],
    //   date: '2024-03-02',
    //   difficulty: 'hard',
    //   status: 'solved'
    // }
  ])

  const activeBookId = ref<number>(1)
  const searchKeyword = ref<string>('')
  
  // 计算属性
  const currentBook = computed(() => 
    books.value.find(book => book.id === activeBookId.value)
  )

  const filteredErrors = computed(() => {
    let result = errors.value.filter(error => error.bookId === activeBookId.value)
    
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase().trim()
      result = result.filter(error => 
        error.title.toLowerCase().includes(keyword) ||
        error.content.toLowerCase().includes(keyword) ||
        error.knowledgePoint.toLowerCase().includes(keyword) ||
        error.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    }
    
    return result
  })

  const getBookById = computed(() => (id: number) => 
    books.value.find(book => book.id === id)
  )

  const getErrorsByBookId = computed(() => (bookId: number) => 
    errors.value.filter(error => error.bookId === bookId)
  )

  // 方法
  const addBook = (name: string, color: string = '#DE868F') => {
    const newBook: Book = {
      id: Date.now(), // 简单的ID生成，实际项目中应该用更好的方式
      name: name.trim(),
      count: 0,
      color,
      createTime: new Date().toISOString().split('T')[0]
    }
    books.value.push(newBook)
    return newBook
  }

  const deleteBook = (bookId: number) => {
    // 删除错题本和其中的所有错题
    books.value = books.value.filter(book => book.id !== bookId)
    errors.value = errors.value.filter(error => error.bookId !== bookId)
    
    // 如果删除的是当前选中的错题本，切换到第一个
    if (activeBookId.value === bookId && books.value.length > 0) {
      activeBookId.value = books.value[0].id
    }
  }

  const addErrorToBook = (
    bookId: number, 
    question: Question, 
    userAnswer: string,
    questionIndex?: number
  ) => {
    const newError: ErrorQuestion = {
      id: Date.now() + Math.random(), // 确保唯一性
      bookId,
      title: question.title,
      content: `第${questionIndex !== undefined ? questionIndex + 1 : ''}题错题记录`,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer,
      explanation: question.explanation,
      knowledgePoint: question.knowledgePoint,
      relatedQuestion: question.relatedQuestion,
      tags: [question.knowledgePoint], // 基于知识点生成标签
      date: new Date().toISOString().split('T')[0],
      difficulty: 'medium', // 默认中等难度
      status: 'unsolved',
      source: '在线测试'
    }
    
    errors.value.push(newError)
    
    // 更新错题本的计数
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.count++
    }
    
    return newError
  }

  const removeError = (errorId: number) => {
    const errorIndex = errors.value.findIndex(error => error.id === errorId)
    if (errorIndex !== -1) {
      const error = errors.value[errorIndex]
      const book = books.value.find(b => b.id === error.bookId)
      
      // 更新错题本计数
      if (book && book.count > 0) {
        book.count--
      }
      
      errors.value.splice(errorIndex, 1)
    }
  }

  const updateErrorStatus = (errorId: number, status: 'solved' | 'unsolved') => {
    const error = errors.value.find(e => e.id === errorId)
    if (error) {
      error.status = status
    }
  }

  const setActiveBook = (bookId: number) => {
    activeBookId.value = bookId
  }

  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }

  const clearSearch = () => {
    searchKeyword.value = ''
  }

  // 获取统计信息
  const getStatistics = computed(() => {
    const totalErrors = errors.value.length
    const solvedErrors = errors.value.filter(e => e.status === 'solved').length
    const unsolvedErrors = totalErrors - solvedErrors
    
    const difficultyStats = {
      easy: errors.value.filter(e => e.difficulty === 'easy').length,
      medium: errors.value.filter(e => e.difficulty === 'medium').length,
      hard: errors.value.filter(e => e.difficulty === 'hard').length
    }
    
    return {
      totalErrors,
      solvedErrors,
      unsolvedErrors,
      solvedRate: totalErrors > 0 ? Math.round((solvedErrors / totalErrors) * 100) : 0,
      difficultyStats
    }
  })

  // 批量操作
  const batchDeleteErrors = (errorIds: number[]) => {
    errorIds.forEach(id => removeError(id))
  }

  const moveErrorToBook = (errorId: number, targetBookId: number) => {
    const error = errors.value.find(e => e.id === errorId)
    if (error) {
      const oldBook = books.value.find(b => b.id === error.bookId)
      const newBook = books.value.find(b => b.id === targetBookId)
      
      if (oldBook && newBook) {
        // 更新计数
        if (oldBook.count > 0) oldBook.count--
        newBook.count++
        
        // 更新错题归属
        error.bookId = targetBookId
      }
    }
  }

  return {
    // 状态
    books,
    errors,
    activeBookId,
    searchKeyword,
    
    // 计算属性
    currentBook,
    filteredErrors,
    getBookById,
    getErrorsByBookId,
    getStatistics,
    
    // 方法
    addBook,
    deleteBook,
    addErrorToBook,
    removeError,
    updateErrorStatus,
    setActiveBook,
    setSearchKeyword,
    clearSearch,
    batchDeleteErrors,
    moveErrorToBook
  }
})