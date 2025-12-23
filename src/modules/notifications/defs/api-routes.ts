const prefix = '/notifications';
const ApiRoutes = {
  ReadAll: prefix,
  UnreadCount: prefix + '/unread-count',
  MarkAsRead: prefix + '/{id}/mark-as-read',
  MarkAllAsRead: prefix + '/mark-all-as-read',
  DeleteOne: prefix + '/{id}',
  DeleteAll: prefix,
};

export default ApiRoutes;
