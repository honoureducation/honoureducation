import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { learnerAPI, errorMessage } from '../api';
import { CourseCard, Spinner, EmptyState, ProgressBar, btnPrimary } from '../components';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    learnerAPI
      .get('/me/courses')
      .then((r) => setCourses(r.data.courses))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-slate-900">My courses</h1>
      <div className="mt-8">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Could not load your courses">{error}</EmptyState>
        ) : courses.length === 0 ? (
          <EmptyState title="You don't have any courses yet" action={<Link to="/learn" className={btnPrimary}>Browse courses</Link>}>
            Courses you buy will appear here.
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard
                key={c._id}
                course={c}
                to={`/learn/my-courses/${c.slug}`}
                footer={
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                      <span>{c.progressPercent === 100 ? 'Completed' : c.progressPercent ? 'In progress' : 'Not started'}</span>
                      <span>{c.progressPercent || 0}%</span>
                    </div>
                    <ProgressBar value={c.progressPercent} />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
