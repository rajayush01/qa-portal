import ExcelJS from 'exceljs';
import { IQuestion } from '../models/Question';
import { Response } from 'express';

export const streamQuestionsExcel = async (
  res: Response,
  questions: IQuestion[],
  filenamePrefix = 'questions'
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Q&A Portal';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Questions', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Question ID', key: 'questionId', width: 18 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Anonymous', key: 'anonymous', width: 12 },
    { header: 'Department', key: 'department', width: 16 },
    { header: 'Location', key: 'location', width: 16 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Question', key: 'question', width: 50 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Answer', key: 'answer', width: 50 },
    { header: 'Submitted At', key: 'submittedAt', width: 20 },
    { header: 'Answered At', key: 'answeredAt', width: 20 },
    { header: 'Admin Answered By', key: 'answeredBy', width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  questions.forEach((q) => {
    sheet.addRow({
      questionId: q.questionId,
      name: q.isAnonymous ? 'Anonymous' : q.name || '—',
      anonymous: q.isAnonymous ? 'Yes' : 'No',
      department: q.department,
      location: q.location,
      category: q.category,
      question: q.questionText,
      status: q.status,
      answer: q.answer || (q.answeredInPerson ? 'Answered in person (live session)' : ''),
      submittedAt: q.createdAt ? new Date(q.createdAt).toLocaleString() : '',
      answeredAt: q.answeredAt ? new Date(q.answeredAt).toLocaleString() : '',
      answeredBy: q.answeredByName || '',
    });
  });

  sheet.autoFilter = { from: 'A1', to: 'L1' };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filenamePrefix}-${Date.now()}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
};
