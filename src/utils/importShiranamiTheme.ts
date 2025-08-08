import { supabase } from '@/integrations/supabase/client';
import shiranamiTheme from '@/themes/04-shiranami-sakura.json';

export async function importShiranamiSakuraTheme() {
  try {
    console.log('Importing Shiranami Sakura theme...');
    
    // Check if theme already exists
    const { data: existingTheme } = await supabase
      .from('child_themes')
      .select('id')
      .eq('name', shiranamiTheme.name)
      .single();

    if (existingTheme) {
      console.log('Theme already exists, updating...');
      const { error } = await supabase
        .from('child_themes')
        .update({
          display_name: shiranamiTheme.display_name,
          description: shiranamiTheme.description,
          version: shiranamiTheme.version,
          author: shiranamiTheme.author,
          preview_image_url: shiranamiTheme.preview_image_url,
          homepage_component: shiranamiTheme.homepage_component,
          theme_config: shiranamiTheme.theme_config,
          custom_css: shiranamiTheme.custom_css,
          updated_at: new Date().toISOString()
        })
        .eq('name', shiranamiTheme.name);

      if (error) throw error;
      console.log('✅ Shiranami Sakura theme updated successfully');
    } else {
      console.log('Creating new theme...');
      const { error } = await supabase
        .from('child_themes')
        .insert({
          name: shiranamiTheme.name,
          display_name: shiranamiTheme.display_name,
          description: shiranamiTheme.description,
          version: shiranamiTheme.version,
          author: shiranamiTheme.author,
          is_active: shiranamiTheme.is_active,
          is_default: shiranamiTheme.is_default,
          preview_image_url: shiranamiTheme.preview_image_url,
          homepage_component: shiranamiTheme.homepage_component,
          theme_config: shiranamiTheme.theme_config,
          custom_css: shiranamiTheme.custom_css
        });

      if (error) throw error;
      console.log('✅ Shiranami Sakura theme imported successfully');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to import Shiranami Sakura theme:', error);
    return { success: false, error };
  }
}

// Auto-import on module load for development
if (typeof window !== 'undefined') {
  importShiranamiSakuraTheme();
}