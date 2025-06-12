import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  getMistakeNotebooks,
  addMistakeNotebook,
  updateMistakeNotebook,
  deleteMistakeNotebook,
  getWrongQuestionsByNotebookId,
  addWrongQuestionToNotebook,
  removeWrongQuestionFromNotebook,
  searchWrongQuestions,
  setWrongQuestionState,
  type MistakeNotebook,
  type WrongQuestion
} from '@/apis/mistakeNotebookApi';
import { tempStorage } from '@/utils/tempStorage';

// 扩展错题接口，添加前端需要的字段
export interface ErrorQuestion extends WrongQuestion {
  title: string; // 从 topic 映射过来
  status: 'solved' | 'unsolved'; // 错题状态
  date: string; // 添加日期
  knowledgePoint: string; // 从 knowledgeTags 第一个标签映射
  source?: string; // 来源
  options: string[]; // 从 a,b,c,d 组合而来
  correctAnswer: string; // 从 answer 映射
  userAnswer: string; // 用户答案
  explanation: string; // 从 answerAnalysis 映射
  relatedQuestion?: string; // 关联题目
  tags: string[]; // 从 knowledgeTags 映射
}

// 错题本接口扩展
export interface ErrorNotebook extends MistakeNotebook {
  // count 字段已经在 MistakeNotebook 中定义了，不需要重复
}

export const useErrorNotebookStore = defineStore('errorNotebook', () => {
  // 状态
  const books = ref<ErrorNotebook[]>([]);
  const activeBookId = ref<string>('');
  const errors = ref<ErrorQuestion[]>([]);
  const searchKeyword = ref('');
  const loading = ref(false);

  // 计算属性
  const currentBook = computed(() => 
    books.value.find(book => book.id === activeBookId.value)
  );

  const filteredErrors = computed(() => {
    if (!searchKeyword.value.trim()) return errors.value;
    
    const keyword = searchKeyword.value.toLowerCase();
    return errors.value.filter(error => 
      error.title.toLowerCase().includes(keyword) ||
      error.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      error.knowledgePoint.toLowerCase().includes(keyword)
    );
  });

  const getStatistics = computed(() => {
    const totalErrors = errors.value.length;
    const solvedErrors = errors.value.filter(error => error.status === 'solved').length;
    const solvedRate = totalErrors > 0 ? Math.round((solvedErrors / totalErrors) * 100) : 0;
    
    return {
      totalErrors,
      solvedErrors,
      solvedRate
    };
  });

  // 数据转换函数
  const convertWrongQuestionToError = (wrongQuestion: WrongQuestion): ErrorQuestion => {
    const errorId = wrongQuestion.id;
    const tempStatus = tempStorage.getErrorStatus(errorId);
    
    let tags: string[] = [];
    if (wrongQuestion.knowledgeTags) {
      if (Array.isArray(wrongQuestion.knowledgeTags)) {
        tags = wrongQuestion.knowledgeTags;
      } else if (typeof wrongQuestion.knowledgeTags === 'string') {
        // 如果是字符串，可能是 JSON 字符串或逗号分隔的字符串
        try {
          const parsed = JSON.parse(wrongQuestion.knowledgeTags);
          tags = Array.isArray(parsed) ? parsed : [wrongQuestion.knowledgeTags];
        } catch {
          // 如果不是 JSON，尝试按逗号分隔
          tags = wrongQuestion.knowledgeTags.includes(',') 
            ? wrongQuestion.knowledgeTags.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [wrongQuestion.knowledgeTags];
        }
      }
    }
    
    // 优先使用后端返回的状态，如果没有则使用本地存储
    let status: 'solved' | 'unsolved' = 'unsolved';
    if (wrongQuestion.state) {
      status = wrongQuestion.state as 'solved' | 'unsolved';
    } else {
      status = tempStatus.status;
    }
    
    return {
      ...wrongQuestion,
      title: wrongQuestion.topic,
      status: status,
      date: new Date().toLocaleDateString(),
      knowledgePoint: tags[0] || '未分类', // 使用第一个标签作为主知识点
      options: [
        `A.${wrongQuestion.a}`,
        `B.${wrongQuestion.b}`,
        `C.${wrongQuestion.c}`,
        `D.${wrongQuestion.d}`
      ],
      correctAnswer: wrongQuestion.answer.toUpperCase(),
      userAnswer: tempStatus.userAnswer || 'A',
      explanation: wrongQuestion.answerAnalysis || '暂无解析',
      tags: tags, // 使用处理后的标签数组
      source: '题目练习' // 临时默认值
    };
  };

  // API 调用方法
  const fetchBooks = async () => {
    try {
      loading.value = true;
      const response = await getMistakeNotebooks();
      if (response.code === 0) {
        // 后端已经返回了count字段，直接使用
        books.value = response.data;
        
        // 如果没有激活的错题本，设置第一个为激活状态
        if (!activeBookId.value && books.value.length > 0) {
          activeBookId.value = books.value[0].id;
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      message.error('获取错题本列表失败');
      console.error('获取错题本失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchErrors = async (bookId: string) => {
    if (!bookId) return;
    
    try {
      loading.value = true;
      const response = await getWrongQuestionsByNotebookId(bookId);
      if (response.code === 0) {
        errors.value = response.data.map(convertWrongQuestionToError);
        
        // 同步更新错题本的实际count
        const book = books.value.find(b => b.id === bookId);
        if (book) {
          book.count = response.data.length;
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      message.error('获取错题列表失败');
      console.error('获取错题失败:', error);
      errors.value = []; // 清空错题列表
    } finally {
      loading.value = false;
    }
  };

  // 刷新单个错题本的count
  const refreshBookCount = async (bookId: string) => {
    try {
      const response = await getWrongQuestionsByNotebookId(bookId);
      if (response.code === 0) {
        const book = books.value.find(b => b.id === bookId);
        if (book) {
          book.count = response.data.length;
        }
      }
    } catch (error) {
      console.error('刷新错题本计数失败:', error);
    }
  };

  const addBook = async (name: string, color: string): Promise<ErrorNotebook> => {
    try {
      const response = await addMistakeNotebook({ name, color });
      if (response.code === 0) {
        const newBook: ErrorNotebook = {
          id: response.data,
          name,
          color,
          userId: '',
          createTime: Date.now(),
          count: 0
        };
        books.value.push(newBook);
        return newBook;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('添加错题本失败:', error);
      throw error;
    }
  };

  const updateBook = async (id: string, name: string, color: string) => {
    try {
      const response = await updateMistakeNotebook({ id, name, color });
      if (response.code === 0) {
        const bookIndex = books.value.findIndex(book => book.id === id);
        if (bookIndex !== -1) {
          books.value[bookIndex] = { ...books.value[bookIndex], name, color };
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('更新错题本失败:', error);
      throw error;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const response = await deleteMistakeNotebook(bookId);
      if (response.code === 0) {
        books.value = books.value.filter(book => book.id !== bookId);
        
        // 如果删除的是当前激活的错题本，切换到第一个
        if (activeBookId.value === bookId) {
          activeBookId.value = books.value.length > 0 ? books.value[0].id : '';
          errors.value = []; // 清空错题列表
          if (activeBookId.value) {
            await fetchErrors(activeBookId.value);
          }
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('删除错题本失败:', error);
      throw error;
    }
  };

  const addErrorToBook = async (choiceQuestionId: string, bookId: string) => {
    try {
      const response = await addWrongQuestionToNotebook({
        choiceQuestionId,
        mistakeNoteBookId: bookId
      });
      if (response.code === 0) {
        // 刷新当前错题本的错题列表（这会同步更新count）
        if (activeBookId.value === bookId) {
          await fetchErrors(bookId);
        } else {
          // 如果不是当前错题本，只更新该错题本的count
          await refreshBookCount(bookId);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('添加错题失败:', error);
      throw error;
    }
  };

  const removeError = async (errorId: string) => {
    if (!activeBookId.value) return;
    
    try {
      const response = await removeWrongQuestionFromNotebook({
        choiceQuestionId: errorId,
        mistakeNoteBookId: activeBookId.value
      });
      
      if (response.code === 0) {
        errors.value = errors.value.filter(error => error.id !== errorId);
        // 删除本地存储的状态
        tempStorage.removeErrorStatus(errorId);
        // 同步更新错题本计数
        await refreshBookCount(activeBookId.value);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('删除错题失败:', error);
      throw error;
    }
  };

  const moveErrorToBook = async (errorId: string, targetBookId: string) => {
    if (!activeBookId.value) return;
    
    try {
      // 先从当前错题本移除
      const removeResponse = await removeWrongQuestionFromNotebook({
        choiceQuestionId: errorId,
        mistakeNoteBookId: activeBookId.value
      });
      
      if (removeResponse.code !== 0) {
        throw new Error(removeResponse.message);
      }
      
      // 再添加到目标错题本
      const addResponse = await addWrongQuestionToNotebook({
        choiceQuestionId: errorId,
        mistakeNoteBookId: targetBookId
      });
      
      if (addResponse.code !== 0) {
        throw new Error(addResponse.message);
      }
      
      // 更新本地状态
      errors.value = errors.value.filter(error => error.id !== errorId);
      
      // 同步更新两个错题本的计数
      await Promise.all([
        refreshBookCount(activeBookId.value),
        refreshBookCount(targetBookId)
      ]);
      
    } catch (error: any) {
      console.error('移动错题失败:', error);
      throw error;
    }
  };

  const batchDeleteErrors = async (errorIds: string[]) => {
    if (!activeBookId.value || errorIds.length === 0) return;
    
    try {
      // 并行删除所有错题
      const promises = errorIds.map(errorId => 
        removeWrongQuestionFromNotebook({
          choiceQuestionId: errorId,
          mistakeNoteBookId: activeBookId.value
        })
      );
      
      const results = await Promise.allSettled(promises);
      
      // 检查是否有失败的请求
      const failedCount = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.code !== 0)
      ).length;
      
      if (failedCount > 0) {
        message.warning(`${errorIds.length - failedCount} 道错题删除成功，${failedCount} 道失败`);
      }
      
      // 更新本地状态 - 只移除成功删除的错题
      const successfullyDeleted = errorIds.filter((_, index) => {
        const result = results[index];
        return result.status === 'fulfilled' && result.value.code === 0;
      });
      
      errors.value = errors.value.filter(error => !successfullyDeleted.includes(error.id));
      tempStorage.batchRemoveErrorStatus(successfullyDeleted);
      
      // 同步更新错题本计数
      await refreshBookCount(activeBookId.value);
      
    } catch (error: any) {
      console.error('批量删除失败:', error);
      throw error;
    }
  };

  const batchMoveErrors = async (errorIds: string[], targetBookId: string) => {
    if (!activeBookId.value || errorIds.length === 0) return;
    
    try {
      // 并行移动所有错题
      const promises = errorIds.map(errorId => moveErrorToBook(errorId, targetBookId));
      await Promise.all(promises);
    } catch (error: any) {
      console.error('批量移动失败:', error);
      throw error;
    }
  };

  // 本地状态管理方法
  const updateErrorStatus = async (errorId: string, status: 'solved' | 'unsolved') => {
    if (!activeBookId.value) return;
    
    try {
      // 调用后端API更新状态
      const response = await setWrongQuestionState({
        choiceQuestionId: errorId,
        mistakeNoteBookId: activeBookId.value,
        state: status
      });
      
      if (response.code === 0) {
        // API调用成功后，保存到本地存储
        tempStorage.saveErrorStatus(errorId, status);
        
        // 更新本地状态
        const error = errors.value.find(e => e.id === errorId);
        if (error) {
          error.status = status;
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('更新错题状态失败:', error);
      throw error;
    }
  };

  const searchErrors = async (keyword: string, tags: string[] = []) => {
    if (!activeBookId.value) return;
    
    try {
      // 如果有关键词，尝试调用后端搜索API
      if (keyword.trim() || tags.length > 0) {
        const response = await searchWrongQuestions({
          mistakeNotebookId: activeBookId.value,
          topic: keyword,
          knowledgeTags: tags
        });
        
        if (response.code === 0) {
          errors.value = response.data.map(convertWrongQuestionToError);
          return;
        }
      }
      
      // 如果后端搜索失败或没有关键词，使用本地搜索
      searchKeyword.value = keyword;
      
    } catch (error) {
      console.error('搜索错题失败:', error);
      // 搜索失败时，回退到本地搜索
      searchKeyword.value = keyword;
    }
  };

  const setActiveBook = async (bookId: string) => {
    if (activeBookId.value === bookId) return;
    
    activeBookId.value = bookId;
    searchKeyword.value = ''; // 清空搜索关键词
    if (bookId) {
      await fetchErrors(bookId);
    } else {
      errors.value = [];
    }
  };

  // 初始化
  const initialize = async () => {
    try {
      await fetchBooks();
      if (activeBookId.value) {
        await fetchErrors(activeBookId.value);
      }
    } catch (error) {
      console.error('初始化失败:', error);
      // 初始化失败时，设置默认状态
      books.value = [];
      errors.value = [];
      activeBookId.value = '';
    }
  };

  // 清理过期的临时数据
  const cleanupTempData = () => {
    tempStorage.cleanExpiredData(30); // 清理30天前的数据
  };

  return {
    // 状态
    books,
    activeBookId,
    errors,
    searchKeyword,
    loading,
    
    // 计算属性
    currentBook,
    filteredErrors,
    getStatistics,
    
    // 方法
    fetchBooks,
    fetchErrors,
    refreshBookCount,
    addBook,
    updateBook,
    deleteBook,
    addErrorToBook,
    removeError,
    moveErrorToBook,
    batchDeleteErrors,
    batchMoveErrors,
    updateErrorStatus,
    searchErrors,
    setActiveBook,
    initialize,
    cleanupTempData
  };
});