-- Third migration: Add RLS policies and complete setup
-- RLS Policies for role_dashboards
CREATE POLICY "Admins can manage role dashboards" ON public.role_dashboards
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view their role dashboard" ON public.role_dashboards
  FOR SELECT USING (
    role_name = (SELECT role FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for help_content
CREATE POLICY "Admins can manage help content" ON public.help_content
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view help for their role" ON public.help_content
  FOR SELECT USING (
    is_active = true AND (
      role_target = (SELECT role FROM profiles WHERE user_id = auth.uid()) OR
      role_target = 'member' -- General help available to all
    )
  );

-- RLS Policies for series_covers
CREATE POLICY "Admins can manage all series covers" ON public.series_covers
  FOR ALL USING (is_admin());

CREATE POLICY "Uploaders can manage series covers" ON public.series_covers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('uploader', 'admin', 'author'))
  );

CREATE POLICY "Anyone can view active covers" ON public.series_covers
  FOR SELECT USING (is_active = true);

-- RLS Policies for bulk_uploads
CREATE POLICY "Admins can view all bulk uploads" ON public.bulk_uploads
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own uploads" ON public.bulk_uploads
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can create bulk uploads" ON public.bulk_uploads
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('uploader', 'admin', 'author'))
  );

-- RLS Policies for user_reading_preferences
CREATE POLICY "Users can manage their own reading preferences" ON public.user_reading_preferences
  FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_role_dashboards_updated_at
  BEFORE UPDATE ON public.role_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_content_updated_at
  BEFORE UPDATE ON public.help_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_uploads_updated_at
  BEFORE UPDATE ON public.bulk_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reading_preferences_updated_at
  BEFORE UPDATE ON public.user_reading_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();