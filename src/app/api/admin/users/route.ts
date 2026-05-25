
import { NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient.from('route233_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: { users }, error } = await adminClient.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Also fetch profiles to join
    const { data: profiles } = await adminClient.from('route233_profiles').select('*');
    
    const combinedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      profile: profiles?.find(p => p.id === u.id) || null
    }));

    return NextResponse.json({ success: true, data: combinedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient.from('route233_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const { error } = await adminClient.auth.admin.deleteUser(userId);
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient.from('route233_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { email, password, fullName, phone, role } = body;
    
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: newAuthUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    
    if (createError) throw createError;

    // Create profile
    const { error: profileError } = await adminClient.from('route233_profiles').insert([{
      id: newAuthUser.user.id,
      full_name: fullName,
      phone_number: phone || '',
      role: role || 'customer'
    }]);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, user: newAuthUser.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
